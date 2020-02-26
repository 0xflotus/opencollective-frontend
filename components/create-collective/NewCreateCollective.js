import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from '@rebass/grid';
import { get, pick } from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const gqlV2 = gql; // Needed for lint validation of api v2 schema.

import Page from '../Page';
import { H1, P } from '../Text';
import CreateCollectiveForm from './sections/CreateCollectiveForm';
import CollectiveCategoryPicker from './sections/CollectiveCategoryPicker';
import ConnectGithub from './sections/ConnectGithub';
import SignInOrJoinFree from '../SignInOrJoinFree';
import { withUser } from '../UserProvider';

import { getLoggedInUserQuery } from '../../lib/graphql/queries';
import { getErrorFromGraphqlException, compose } from '../../lib/utils';
import { Router } from '../../server/pages';

class NewCreateCollective extends Component {
  static propTypes = {
    host: PropTypes.object,
    query: PropTypes.object,
    LoggedInUser: PropTypes.object, // from withUser
    refetchLoggedInUser: PropTypes.func.isRequired, // from withUser
    intl: PropTypes.object.isRequired,
    createCollectiveV2: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      collective: {},
      result: {},
      category: null,
      github: null,
      form: false,
      error: null,
    };
    this.createCollective = this.createCollective.bind(this);
    this.messages = defineMessages({
      'host.apply.title': {
        id: 'host.apply.title',
        defaultMessage: 'Apply to create a new {hostname} collective',
      },
      'collective.create.title': {
        id: 'collective.create.title',
        defaultMessage: 'Create an Open Collective',
      },
      'collective.create.description': {
        id: 'collective.create.description',
        defaultMessage: 'The place for your community to collect money and share your finance in full transparency.',
      },
    });
  }

  componentDidMount() {
    const { query } = this.props;
    if (query.category === 'opensource' || query.token) {
      this.setState({ category: 'opensource' });
      if (query.step === 'form') {
        this.setState({ form: true });
      }
      if (!query.step) {
        this.setState({ form: false });
      }
    } else if (query.category === 'community') {
      this.setState({ category: 'community' });
    } else if (query.category === 'climate') {
      this.setState({ category: 'climate' });
    } else if (!query.category) {
      this.setState({ category: null });
    }
    return;
  }

  componentDidUpdate(oldProps) {
    const { query } = this.props;
    if (oldProps.query.step !== query.step) {
      if (query.step === 'form') {
        this.setState({ form: true });
      } else {
        this.setState({ form: false });
      }
    }
    if (oldProps.query.category !== query.category) {
      if (query.category === 'opensource' || query.token) {
        this.setState({ category: 'opensource' });
      } else if (query.category === 'community') {
        this.setState({ category: 'community' });
      } else if (query.category === 'climate') {
        this.setState({ category: 'climate' });
      } else if (!query.category) {
        this.setState({ category: null });
      }
    }
    return;
  }

  handleChange(key, value) {
    this.setState({
      [key]: value,
    });
  }

  async createCollective(collective) {
    // check we have agreed to TOS
    if (!collective.tos) {
      this.setState({
        error: 'Please accept the terms of service',
      });
      return;
    }

    // set state to loading
    this.setState({ status: 'loading' });

    // prepare object
    collective.tags = [this.state.category];
    if (this.state.github) {
      collective.githubHandle = this.state.github.handle;
      this.props.host = { slug: 'opensource' };
    }
    delete collective.tos;

    // try mutation
    try {
      const res = await this.props.createCollectiveV2({
        collective,
        host: this.props.host ? { slug: this.props.host.slug } : null,
        automateApprovalWithGithub: this.state.github ? true : false,
      });
      const newCollective = res.data.createCollective;
      this.setState({
        status: 'idle',
        result: { success: 'Collective created successfully' },
      });
      await this.props.refetchLoggedInUser();
      Router.pushRoute('collective', { slug: newCollective.slug });
    } catch (err) {
      const errorMsg = getErrorFromGraphqlException(err).message;
      this.setState({ status: 'idle', error: errorMsg });
    }
  }

  render() {
    const { LoggedInUser, query } = this.props;
    const { category, form, error } = this.state;
    const { token } = query;

    const canApply = get(this.props.host, 'settings.apply') || true;

    return (
      <Page>
        <div className="CreateCollective">
          {canApply && !LoggedInUser && (
            <Fragment>
              <Flex flexDirection="column" alignItems="center" mb={5} p={2}>
                <Flex flexDirection="column" p={4} mt={2}>
                  <Box mb={3}>
                    <H1 fontSize="H3" lineHeight="H3" fontWeight="bold" textAlign="center">
                      Join Open Collective
                    </H1>
                  </Box>
                  <Box textAlign="center">
                    <P fontSize="Paragraph" color="black.600" mb={1}>
                      Create an account (or sign in) to start a collective.
                    </P>
                  </Box>
                </Flex>
                <SignInOrJoinFree />
              </Flex>
            </Fragment>
          )}
          {canApply && LoggedInUser && !category && (
            <CollectiveCategoryPicker query={query} onChange={(key, value) => this.handleChange(key, value)} />
          )}
          {canApply && LoggedInUser && category && category !== 'opensource' && (
            <CreateCollectiveForm
              host={this.props.host}
              collective={this.state.collective}
              onSubmit={this.createCollective}
              onChange={(key, value) => this.handleChange(key, value)}
              error={error}
              query={query}
            />
          )}
          {canApply && LoggedInUser && category === 'opensource' && !form && (
            <ConnectGithub token={token} query={query} onChange={(key, value) => this.handleChange(key, value)} />
          )}
          {canApply && LoggedInUser && category === 'opensource' && form && (
            <CreateCollectiveForm
              host={this.props.host}
              collective={this.state.collective}
              onSubmit={this.createCollective}
              onChange={(key, value) => this.handleChange(key, value)}
              error={error}
              query={query}
            />
          )}
        </div>
      </Page>
    );
  }
}

const createCollectiveQueryV2 = gqlV2`
  mutation createCollective(
    $collective: CreateCollectiveInput!
    $host: AccountInput
    $automateApprovalWithGithub: Boolean
  ) {
    createCollective(collective: $collective, host: $host, automateApprovalWithGithub: $automateApprovalWithGithub) {
      name
      slug
      tags
      description
      githubHandle
    }
  }
`;

const addCreateCollectiveMutationV2 = graphql(createCollectiveQueryV2, {
  options: {
    context: { apiVersion: '2' },
  },
  props: ({ mutate }) => ({
    createCollectiveV2: async ({ collective, host }) => {
      const CreateCollectiveInputType = pick(collective, [
        'slug',
        'name',
        'description',
        'githubHandle',
        'tags',
        CreateCollectiveInputType,
      ]);
      return await mutate({
        variables: {
          collective: CreateCollectiveInputType,
          host: host,
        },
        update: (store, { data: { createCollectiveV2 } }) => {
          const data = store.readQuery({ query: getLoggedInUserQuery });
          data.LoggedInUser.memberOf.push({
            __typename: 'Member',
            collective: createCollectiveV2,
            role: 'ADMIN',
          });
          store.writeQuery({ query: getLoggedInUserQuery, data });
        },
      });
    },
  }),
});

export default compose(addCreateCollectiveMutationV2)(injectIntl(withUser(NewCreateCollective)));
