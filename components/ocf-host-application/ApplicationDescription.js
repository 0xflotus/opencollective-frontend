import React from 'react';
import { FormattedMessage } from 'react-intl';

import { getI18nLink } from '../I18nFormatters';
import { H5, P } from '../Text';

const ApplicationDescription = () => (
  <React.Fragment>
    <P fontSize="13px" lineHeight="20px" color="#090A0A" mb={3}>
      <FormattedMessage
        id="OCFHostApplication.importance"
        defaultMessage="It can take years for a group to get 501c3 non-profit status.  Fiscal hosts are especially helpful to newly formed nonprofit groups- large and small.
          We act as a legal entity for your group-organizing the back-end of your fundraising efforts. 
          It’s fast and easy to apply to be hosted by our foundation (or you can choose a different fiscal host, or you can self-host), once your group is approved, you can begin collecting funds immediately
           "
      />
    </P>
    <H5 fontSize="13px" lineHeight="20px" color="#090A0A">
      <FormattedMessage id="OCFHostApplication.howItWorks" defaultMessage="How it works:" />
    </H5>
    <P fontSize="13px" lineHeight="20px" color="#090A0A" mb={3}>
      <FormattedMessage
        id="OCFHostApplication.howItWorks.list"
        values={{ lineBreak: <br /> }}
        defaultMessage="• Donations are made to our 501c3 (tax-exempt status applies){lineBreak}
          • We make a “grant” to your group/project{lineBreak}
          • We send donors their receipts, disburse funds/reimburse expenses after your approval, send out the tax forms to independent contractors as applicable{lineBreak}
          • You have complete access to collect, spend, manage your money on our platform.
         "
      />
    </P>
    <P fontSize="13px" lineHeight="20px" color="#090A0A" mb={3}>
      <FormattedMessage
        id="OCFHostApplication.readInfoGuideAndTOS"
        values={{
          InfoGuideLink: getI18nLink({
            color: '#396C6F',
            textDecoration: 'underline',
            openInNewTab: true,
            href: 'https://docs.opencollective.foundation/about/fiscal-sponsorship-info-guide',
          }),
          TOSLink: getI18nLink({
            color: '#396C6F',
            textDecoration: 'underline',
            openInNewTab: true,
            href:
              'https://docs.google.com/document/u/2/d/e/2PACX-1vQ_fs7IOojAHaMBKYtaJetlTXJZLnJ7flIWkwxUSQtTkWUMtwFYC2ssb-ooBnT-Ldl6wbVhNQiCkSms/pub',
          }),
        }}
        defaultMessage="Please take a moment to read our <InfoGuideLink>Info guide</InfoGuideLink> and <TOSLink>Terms and Conditions</TOSLink> before applying, we want to make this process as easy for you as possible, that's why you will need to know a couple of things to have the best possible experience."
      />
    </P>
  </React.Fragment>
);

export default ApplicationDescription;
