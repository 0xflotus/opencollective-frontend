import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import StyledCard from '../StyledCard';

import TransactionItem from './TransactionItem';

const Container = styled.div`
  ${props =>
    !props.isFirst &&
    css`
      border-top: 1px solid #e6e8eb;
    `}
`;

const TransactionsList = ({ transactions }) => {
  if (!transactions?.length) {
    return null;
  }

  return (
    <StyledCard>
      {transactions.map((transaction, idx) => {
        return (
          <Container key={transaction?.id || idx} isFirst={!idx} data-cy="single-transaction">
            <TransactionItem {...transaction} />
          </Container>
        );
      })}
    </StyledCard>
  );
};

TransactionsList.propTypes = {
  isLoading: PropTypes.bool,
  /** When `isLoading` is true, this sets the number of "loadin" items displayed */
  nbPlaceholders: PropTypes.number,
  view: PropTypes.oneOf(['public', 'admin']),
  collective: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    parent: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }),
  }),
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ),
};

TransactionsList.defaultProps = {
  nbPlaceholders: 10,
  view: 'public',
};

export default TransactionsList;
