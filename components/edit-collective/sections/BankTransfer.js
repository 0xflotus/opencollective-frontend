import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Flex, Box } from '@rebass/grid';
import { Add } from '@styled-icons/material/Add';

import { H1, H2, H4, P } from '../../Text';

import Loading from '../../Loading';
import StyledButton from '../../StyledButton';
import Container from '../../Container';
import UpdateBankDetailsForm from '../../UpdateBankDetailsForm';

class BankTransfer extends React.Component {
  static propTypes = {
    /** From graphql query */
    data: PropTypes.object.isRequired,
    /** From intl */
    intl: PropTypes.object.isRequired,
    /** From stripeLoader */
    showManualPaymentMethod: PropTypes.func.isRequired,
    updateBankDetails: PropTypes.func.isRequired,
    setBankDetails: PropTypes.func.isRequired,
    receivingSection: PropTypes.bool,
    showEditManualPaymentMethod: PropTypes.bool,
    showManualPaymentMethodForm: PropTypes.bool,
    submitting: PropTypes.bool,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const showManualPaymentMethodForm = this.props.showManualPaymentMethodForm;
    const submitting = this.props.submitting;
    const { Collective, loading } = this.props.data;
    const showEditManualPaymentMethod = this.props.showEditManualPaymentMethod;
    const existingManualPaymentMethod = !!get(Collective, 'settings.paymentMethods.manual.instructions');
    return loading ? (
      <Loading />
    ) : (
      <Flex className="EditPaymentMethods" flexDirection="column">
        {this.props.receivingSection && showEditManualPaymentMethod && (
          <React.Fragment>
            <H4 mt={2}>
              <FormattedMessage id="editCollective.receivingMoney.bankTransfers" defaultMessage="Bank Transfers" />
            </H4>

            <Box>
              <Container fontSize="Caption" mt={2} color="black.600" textAlign="left">
                {Collective.plan.manualPayments ? (
                  <FormattedMessage
                    id="paymentMethods.manual.add.info"
                    defaultMessage="To receive donations  directly on your bank account on behalf of the collectives that you are hosting"
                  />
                ) : (
                  <FormattedMessage
                    id="paymentMethods.manual.upgradePlan"
                    defaultMessage="Subscribe to our special plans for hosts"
                  />
                )}
                <Box mt={1}>
                  <FormattedMessage
                    id="paymentMethods.manual.add.trial"
                    defaultMessage="Free for the first $1,000 received, "
                  />
                  <a href="/pricing">
                    <FormattedMessage id="paymentMethods.manual.add.seePricing" defaultMessage="see pricing" />
                  </a>
                </Box>
              </Container>
            </Box>
            <Flex alignItems="center" my={2}>
              <StyledButton
                buttonStyle="standard"
                buttonSize="small"
                disabled={!Collective.plan.manualPayments}
                onClick={() => this.props.showManualPaymentMethod(true, false)}
              >
                {existingManualPaymentMethod ? (
                  <FormattedMessage id="paymentMethods.manual.edit" defaultMessage="Edit your bank account details" />
                ) : (
                  <React.Fragment>
                    <Add size="1em" />
                    {'  '}
                    <FormattedMessage id="paymentMethods.manual.add" defaultMessage="Add your bank account details" />
                  </React.Fragment>
                )}
              </StyledButton>
            </Flex>
          </React.Fragment>
        )}
        {showManualPaymentMethodForm && (
          <Container px={3} py={1}>
            <H1 fontSize="3rem" textAlign="left">
              <FormattedMessage
                id="paymentMethod.manual.edit.title"
                defaultMessage="Enable contributors to make donations by wire transfer"
              />
            </H1>
            <H2>
              <FormattedMessage id="paymentMethods.manual.HowDoesItWork" defaultMessage="How does it work?" />
            </H2>
            <Flex>
              <P>
                <FormattedMessage
                  id="paymentMethod.manual.edit.description"
                  defaultMessage='Contributors will be able to choose "Bank Transfer" as a payment method when they check out. The instructions to make the wire transfer will be emailed to them along with a unique order id. Once you received the money, you will be able to mark the corresponding pending order as paid in your host dashboard.'
                />
              </P>
              <img src="/static/images/ManualPaymentMethod-BankTransfer.png" width={350} />
            </Flex>
            <H2>
              <FormattedMessage id="menu.pricing" defaultMessage="Pricing" />
            </H2>
            <P>
              <FormattedMessage
                id="paymentMethod.manual.edit.description.pricing"
                defaultMessage="There is no platform fee for donations made this way. However, we ask you to kindly subscribe to our special plans for fiscal hosts to be able to maintain and improve this feature over time (the first $1,000 of yearly budget are included in the free plan)"
              />
              .
              <br />
              <a href="https://opencollective.com/opencollective">
                <FormattedMessage
                  id="paymentMethods.manual.upgradePlan"
                  defaultMessage="Subscribe to our special plans for hosts"
                />
              </a>
            </P>

            <H2>
              <FormattedMessage
                id="paymentMethods.manual.instructions.title"
                defaultMessage="Define the instructions to make a bank transfer to your account"
              />
            </H2>
            <Box mr={2} css={{ flexGrow: 1 }}>
              <UpdateBankDetailsForm
                value={get(Collective, 'settings.paymentMethods.manual')}
                onChange={bankDetails => this.props.setBankDetails(bankDetails)}
              />
            </Box>
            <Box my={2}>
              <StyledButton
                mr={2}
                buttonStyle="standard"
                buttonSize="medium"
                onClick={() => this.props.showManualPaymentMethod(false, true)}
                disabled={submitting}
              >
                <FormattedMessage id="actions.cancel" defaultMessage="Cancel" />
              </StyledButton>
              <StyledButton
                buttonStyle="primary"
                buttonSize="medium"
                type="submit"
                onClick={() => this.props.updateBankDetails()}
                disabled={submitting}
                loading={submitting}
              >
                <FormattedMessage id="save" defaultMessage="Save" />
              </StyledButton>
            </Box>
          </Container>
        )}
      </Flex>
    );
  }
}

export default injectIntl(BankTransfer);
