import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { get, pick } from 'lodash';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isURL } from 'validator';
import { Close } from 'styled-icons/material/Close';

import events from '../lib/constants/notificationEvents';
import Loading from './Loading';

import { Span } from './Text';
import StyledHr from './StyledHr';
import MessageBox from './MessageBox';
import { Flex, Box } from '@rebass/grid';
import StyledButton from './StyledButton';
import StyledSelect from './StyledSelect';
import { Add } from 'styled-icons/material/Add';
import StyledInputGroup from './StyledInputGroup';

class EditWebhooks extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    collectiveSlug: PropTypes.string.isRequired,
    editWebhooks: PropTypes.func,
    /** From graphql query */
    data: PropTypes.object.isRequired,
    /** From intl */
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { intl } = props;

    this.state = {
      modified: false,
      webhooks: this.getWebhooksFromProps(props),
      isLoaded: false,
      status: null,
      error: '',
    };

    this.messages = defineMessages({
      'webhooks.url.label': {
        id: 'webhooks.url.label',
        defaultMessage: 'URL',
      },
      'webhooks.types.label': {
        id: 'webhooks.types.label',
        defaultMessage: 'Activity',
      },
      'webhooks.add': {
        id: 'webhooks.add',
        defaultMessage: 'Add another webhook',
      },
      'webhooks.remove': {
        id: 'webhooks.remove',
        defaultMessage: 'Remove webhook',
      },
      'webhooks.save': {
        id: 'webhooks.save',
        defaultMessage: 'Save {count} webhooks',
      },
    });

    this.fields = [
      {
        name: 'webhookUrl',
        maxLength: 255,
        type: 'url',
        label: intl.formatMessage(this.messages['webhooks.url.label']),
        required: true,
        defaultValue: '',
      },
      {
        name: 'type',
        type: 'select',
        label: intl.formatMessage(this.messages['webhooks.types.label']),
        options: events,
        multiple: true,
        defaultValue: [],
        required: true,
      },
    ];
  }

  componentDidUpdate(oldProps) {
    if (this.getWebhooksFromProps(oldProps) !== this.getWebhooksFromProps(this.props)) {
      this.setState({ webhooks: this.getWebhooksFromProps(this.props) });
    }
  }

  getWebhooksFromProps = props => {
    return get(props, 'data.Collective.notifications', []);
  };

  validateWebhookUrl = value => {
    return isURL(value);
  };

  cleanWebhookUrl = value => {
    return value ? value.trim().replace(/https?:\/\//, '') : '';
  };

  editWebhook = (index, fieldname, value) => {
    const { webhooks, status } = this.state;
    let newStatus = status;

    if (fieldname === 'webhookUrl') {
      const cleanValue = this.cleanWebhookUrl(value);
      webhooks[index][fieldname] = cleanValue;
      const isValid = webhooks.every(webhook => this.validateWebhookUrl(webhook.webhookUrl));
      newStatus = isValid ? null : 'invalid';
    } else {
      webhooks[index][fieldname] = value;
    }
    this.setState({ webhooks, modified: true, status: newStatus });
  };

  addWebhook = () => {
    const { webhooks } = this.state;
    webhooks.push({ webhookUrl: '', type: events[0] });
    this.setState({ webhooks, modified: true });
  };

  removeWebhook = index => {
    const { webhooks } = this.state;
    if (index < 0 || index > webhooks.length) return;
    webhooks.splice(index, 1);
    this.setState({ webhooks, modified: true });
  };

  handleSubmit = async () => {
    this.setState({ status: 'loading' });
    const { webhooks } = this.state;
    const notifications = webhooks.map(webhook => pick(webhook, ['type', 'webhookUrl', 'id']));

    try {
      await this.props.editWebhooks({ collectiveId: this.props.data.Collective.id, notifications });
      this.setState({ modified: false, status: 'saved' });
      setTimeout(() => {
        this.setState({ status: null });
      }, 3000);
    } catch (e) {
      let message = '';
      if (e && e.errors) {
        message = e.errors[0].message;
      } else if (e && e.graphQLErrors && e.graphQLErrors.length > 0) {
        message = e.graphQLErrors[0].message;
      } else {
        message = e.message;
      }
      this.setState({ status: 'error', error: message });
    }
  };

  renderWebhook = (webhook, index) => {
    const { intl } = this.props;
    const [url, activity] = this.fields;
    const webhookUrl = get(webhook, url.name);

    return (
      <Flex
        py={4}
        key={index}
        width={[0.9, 1]}
        mx={['auto', 0]}
        px={[0, 3, 0]}
        flexWrap="wrap"
        flexDirection="row-reverse"
        justifyContent="space-between"
      >
        <Box my={[0, 4]}>
          <StyledButton
            width={1}
            py={1}
            px={3}
            buttonSize="small"
            buttonStyle="standard"
            onClick={() => this.removeWebhook(index)}
          >
            <Close size="1.2em" />
            {'  '}
            {intl.formatMessage(this.messages['webhooks.remove'])}
          </StyledButton>
        </Box>

        <Box width={[1, 0.75]}>
          <Box mb={4}>
            <Span fontSize="Paragraph" mb={1}>
              {url.label}
            </Span>
            <Span fontSize="3rem" color="#D7D9E0" css={'transform: translate(-60px, 23px); position: absolute;'}>
              {index + 1}
            </Span>
            <StyledInputGroup
              type={url.type}
              name={url.name}
              label={url.label}
              prepend="https://"
              error={!this.validateWebhookUrl(webhookUrl)}
              value={this.cleanWebhookUrl(webhookUrl)}
              onChange={({ target }) => this.editWebhook(index, url.name, target.value)}
            />
          </Box>
          <Box>
            <Span fontSize="Paragraph">{activity.label}</Span>
            <StyledSelect
              options={activity.options}
              value={get(webhook, activity.name)}
              onChange={({ value }) => this.editWebhook(index, activity.name, value)}
            />
          </Box>
        </Box>
      </Flex>
    );
  };

  render() {
    const { webhooks, status, error } = this.state;
    const { intl, data } = this.props;
    const webhooksCount = webhooks.length;

    return data.loading ? (
      <Loading />
    ) : (
      <div>
        <h2>{this.props.title}</h2>
        <StyledHr />

        <div>{webhooks.map(this.renderWebhook)}</div>

        {webhooksCount > 0 && <StyledHr />}

        <Box width={[0.9, 0.75]} mx={['auto', 0]} my={3}>
          <StyledButton
            width={[1]}
            px={[0, 3, 0]}
            borderRadius={6}
            buttonSize="medium"
            buttonStyle="standard"
            css={'border-style: dashed'}
            onClick={() => this.addWebhook()}
          >
            <Add size="1.2em" />
            {'  '}
            {intl.formatMessage(this.messages['webhooks.add'])}
          </StyledButton>
        </Box>

        {status === 'error' && (
          <Box my={3}>
            <MessageBox type="error">{error}</MessageBox>
          </Box>
        )}

        <Box mr={3}>
          <StyledButton
            px={4}
            buttonSize="medium"
            buttonStyle="primary"
            onClick={this.handleSubmit}
            loading={status == 'loading'}
            disabled={data.loading || !this.state.modified || status === 'invalid'}
          >
            {status === 'saved' ? (
              <Span textTransform="capitalize">
                <FormattedMessage id="saved" defaultMessage="saved" />
              </Span>
            ) : (
              <FormattedMessage
                id="webhooks.save"
                defaultMessage="Save {count} webhooks"
                values={{ count: webhooksCount }}
              />
            )}
          </StyledButton>
        </Box>
      </div>
    );
  }
}

const getCollectiveWithNotificationsQuery = gql`
  query CollectiveNotifications($collectiveSlug: String) {
    Collective(slug: $collectiveSlug) {
      id
      type
      slug
      notifications(channel: "webhook") {
        id
        type
        active
        webhookUrl
      }
    }
  }
`;

const editWebhooks = graphql(
  gql`
    mutation editWebhooks($collectiveId: Int!, $notifications: [NotificationInputType]) {
      editWebhooks(collectiveId: $collectiveId, notifications: $notifications) {
        id
        type
        active
        webhookUrl
      }
    }
  `,
  {
    props: ({ mutate, ownProps }) => ({
      editWebhooks: variables =>
        mutate({
          variables,
          update: (cache, { data: { editWebhooks } }) => {
            const { Collective } = cache.readQuery({
              query: getCollectiveWithNotificationsQuery,
              variables: { collectiveSlug: ownProps.collectiveSlug },
            });
            cache.writeQuery({
              query: getCollectiveWithNotificationsQuery,
              data: { Collective: { ...Collective, notifications: editWebhooks } },
            });
          },
        }),
    }),
  },
);

const addData = compose(
  graphql(getCollectiveWithNotificationsQuery),
  editWebhooks,
);

export default injectIntl(addData(EditWebhooks));
