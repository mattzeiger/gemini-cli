/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { ModelMetrics } from '../contexts/SessionContext.js';
import { Colors } from '../colors.js';
import { MODEL_COSTS } from '@google/gemini-cli-core';

interface CostBreakdownTableProps {
  billedInput: number;
  outputTokens: number;
  cachedTokens: number;
  billedInputCost: number;
  outputCost: number;
  cachedCost: number;
  totalCost: number;
  pricing: {
    input: number;
    output: number;
    cached: number;
  };
}

const StatRow: React.FC<{
  tokens: number;
  type: string;
  rate: string;
  cost: number;
}> = ({ tokens, type, rate, cost }) => (
  <Box>
    <Box width={15}>
      <Text>{tokens.toLocaleString()}</Text>
    </Box>
    <Box width={20}>
      <Text>{type}</Text>
    </Box>
    <Box width={15}>
      <Text color={Colors.Gray}>{rate}</Text>
    </Box>
    <Box>
      <Text color={Colors.AccentGreen}>${cost.toFixed(4)}</Text>
    </Box>
  </Box>
);

export const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
  billedInput,
   outputTokens,
   cachedTokens,
   billedInputCost,
   outputCost,
   cachedCost,
   totalCost,
   pricing,
}) => {
  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Box width={15}>
          <Text bold>Tokens</Text>
        </Box>
        <Box width={20}>
          <Text bold>Type</Text>
        </Box>
        <Box width={15}>
          <Text bold>Rate</Text>
        </Box>
        <Box>
          <Text bold>Cost</Text>
        </Box>
      </Box>
      <Box
        borderStyle="round"
        borderBottom={true}
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        width={50}
      ></Box>
      {billedInput > 0 && (
        <StatRow
          tokens={billedInput}
          type="Billed Input"
          rate={`${(pricing.input * 1000000).toFixed(2)}/M`}
          cost={billedInputCost}
        />
      )}
      {outputTokens > 0 && (
        <StatRow
          tokens={outputTokens}
          type="Output"
          rate={`${(pricing.output * 1000000).toFixed(2)}/M`}
          cost={outputCost}
        />
      )}
      {cachedTokens > 0 && (
        <StatRow
          tokens={cachedTokens}
          type="Cached Tokens"
          rate={`${(pricing.cached * 1000000).toFixed(2)}/M`}
          cost={cachedCost}
        />
      )}
      <Box
        borderStyle="round"
        borderBottom={true}
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        width={50}
        marginTop={1}
      ></Box>
      <Box marginTop={1}>
        <Box width={35}>
          <Text bold>Total Estimated Cost:</Text>
        </Box>
        <Box>
          <Text bold color={Colors.AccentGreen}>
            ${totalCost.toFixed(4)}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
