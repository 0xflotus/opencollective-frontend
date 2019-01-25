import React from 'react';
import { PropTypes } from 'prop-types';
import { Flex, Box } from '@rebass/grid';
import { FormattedMessage } from 'react-intl';
import { pick } from 'lodash';

import * as api from '../lib/api';
import { Router } from '../server/pages';

import Link from './Link';
import SignIn from './SignIn';
import CreateProfile from './CreateProfile';
import CreateProfileFAQ from './faqs/CreateProfileFAQ';
import { P } from './Text';
import MessageBox from './MessageBox';
import { createUserQuery } from '../graphql/mutations';
import { graphql } from 'react-apollo';

/**
 * Shows a SignIn form by default, with the ability to switch to SignUp form. It
 * also has the API methods binded, so you can use it directly.
 */
class SignInOrJoinFree extends React.Component {
  static propTypes = {
    /** Redirect URL */
    redirect: PropTypes.string,
    /** createUserQuery binding */
    createUser: PropTypes.func,
  };

  static defaultProps = {
    redirect: '/',
  };

  state = {
    form: 'signIn',
    error: null,
    submitting: false,
    unknownEmailError: false,
  };

  switchForm = form => {
    this.setState({ form });
    window.scrollTo(0, 0);
  };

  signIn = email => {
    if (this.state.submitting) {
      return false;
    }

    this.setState({ submitting: true });
    return api
      .checkUserExistence(email)
      .then(exists => {
        if (exists) {
          return api.signin({ email }, this.props.redirect).then(() => {
            Router.pushRoute('signinLinkSent', { email });
          });
        } else {
          this.setState({ unknownEmailError: true, submitting: false });
        }
      })
      .catch(e => {
        this.setState({ error: e.message, submitting: false });
        window.scrollTo(0, 0);
      });
  };

  createProfile = data => {
    if (this.state.submitting) {
      return false;
    }

    const redirect = window.location.pathname;
    const user = pick(data, ['email', 'firstName', 'lastName']);
    const organizationData = pick(data, ['orgName', 'githubHandle', 'twitterHandle', 'website']);
    const organization = Object.keys(organizationData).length > 0 ? organizationData : null;
    if (organization) {
      organization.name = organization.orgName;
      delete organization.orgName;
    }

    this.setState({ submitting: true });
    this.props
      .createUser({ user, organization, redirect })
      .then(() => {
        Router.pushRoute('signinLinkSent', { email: user.email }).then(() => window.scrollTo(0, 0));
      })
      .catch(error => {
        this.setState({ error: error.message, submitting: false });
        window.scrollTo(0, 0);
      });
  };

  render() {
    const { form, submitting, error, unknownEmailError } = this.state;
    return (
      <Flex flexDirection="column" width={1} alignItems="center">
        {error && (
          <MessageBox type="error" withIcon mb={[3, 4]}>
            {error.replace('GraphQL error: ', 'Error: ')}
          </MessageBox>
        )}
        {form === 'signIn' ? (
          <SignIn
            onSecondaryAction={() => this.switchForm('signUp')}
            onSubmit={this.signIn}
            loading={submitting}
            unknownEmail={unknownEmailError}
          />
        ) : (
          <Flex flexDirection="column" width={1} alignItems="center">
            <Flex justifyContent="center" width={1}>
              <Box width={[0, null, null, 1 / 5]} />
              <CreateProfile
                onPersonalSubmit={this.createProfile}
                onOrgSubmit={this.createProfile}
                onSecondaryAction={() => this.switchForm('signIn')}
                submitting={submitting}
                mx={[2, 4]}
                width={490}
              />
              <CreateProfileFAQ mt={4} display={['none', null, 'block']} width={1 / 5} minWidth="335px" />
            </Flex>
            <P mt={4} color="black.500" fontSize="Caption">
              <FormattedMessage
                id="contributeFlow.createProfile.legal"
                defaultMessage="By joining, you agree to our {tosLink} and {privacyPolicyLink}."
                values={{
                  tosLink: (
                    <Link route="/tos">
                      <FormattedMessage id="tos" defaultMessage="Terms of Service" />
                    </Link>
                  ),
                  privacyPolicyLink: (
                    <Link route="/privacypolicy">
                      <FormattedMessage id="privacyPolicy" defaultMessage="Privacy Policy" />
                    </Link>
                  ),
                }}
              />
            </P>
          </Flex>
        )}
      </Flex>
    );
  }
}

const addCreateUserMutation = graphql(createUserQuery, {
  props: ({ mutate }) => ({
    createUser: variables => mutate({ variables }),
  }),
});

export default addCreateUserMutation(SignInOrJoinFree);
