import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { backgroundColor, borderRadius, width, height } from 'styled-system';
import { clamp } from 'lodash';

const BackgroundBar = styled.div`
  position: relative;

  ${height}
  ${backgroundColor}
  ${borderRadius}
`;

const ProgressBar = styled.div`
  position: absolute;

  ${width}
  ${height}
  ${backgroundColor}
  ${borderRadius}
`;

/**
 * A progress bar that displays the current advancement.
 */
const StyledProgressBar = ({ percentage, color, backgroundColor, height, borderRadius }) => {
  return (
    <BackgroundBar backgroundColor={backgroundColor} height={height} borderRadius={borderRadius}>
      <ProgressBar
        width={`${clamp(percentage, 0, 1) * 100}%`}
        backgroundColor={color}
        height={height}
        borderRadius={borderRadius}
      />
    </BackgroundBar>
  );
};

StyledProgressBar.propTypes = {
  /** Current progress, between 0 and 1 */
  percentage: PropTypes.number.isRequired,
  /** Color of the unfilled bar */
  backgroundColor: PropTypes.string,
  /** Color of the filled bar */
  color: PropTypes.string,
  /** Height */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Border-radius */
  borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

StyledProgressBar.defaultProps = {
  height: 4,
  backgroundColor: 'rgba(9, 10, 10, 0.04)',
  color: 'green.500',
  borderRadius: 16,
};

export default StyledProgressBar;
