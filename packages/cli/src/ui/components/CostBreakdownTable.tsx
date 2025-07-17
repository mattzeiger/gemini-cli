/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Colors } from '../colors.js';
import { TieredCostSummary } from '../utils/computeStats.js';
import { MODEL_COSTS } from '@google/gemini-cli-core';

interface CostBreakdownTableProps {
  tieredSummary: TieredCostSummary;
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
  tieredSummary,
}) => {
  const { tier1, tier2, totalCost } = tieredSummary;
  const pricing = MODEL_COSTS['gemini-2.5-pro'];

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
      {tier1.billedInput > 0 && (
        <StatRow
          tokens={tier1.billedInput}
          type="Billed Input (Tier 1)"
          rate={`${(pricing.small_prompt.input * 1000000).toFixed(2)}/M`}
          cost={tier1.billedInputCost}
        />
      )}
      {tier2.billedInput > 0 && (
        <StatRow
          tokens={tier2.billedInput}
          type="Billed Input (Tier 2)"
          rate={`${(pricing.large_prompt.input * 1000000).toFixed(2)}/M`}
          cost={tier2.billedInputCost}
        />
      )}
      {tier1.outputTokens > 0 && (
        <StatRow
          tokens={tier1.outputTokens}
          type="Output (Tier 1)"
          rate={`${(pricing.small_prompt.output * 1000000).toFixed(2)}/M`}
          cost={tier1.outputCost}
        />
      )}
      {tier2.outputTokens > 0 && (
        <StatRow
          tokens={tier2.outputTokens}
          type="Output (Tier 2)"
          rate={`${(pricing.large_prompt.output * 1000000).toFixed(2)}/M`}
          cost={tier2.outputCost}
        />
      )}
      {tier1.cachedTokens > 0 && (
        <StatRow
          tokens={tier1.cachedTokens}
          type="Cached (Tier 1)"
          rate={`${(pricing.small_prompt.cached * 1000000).toFixed(3)}/M`}
          cost={tier1.cachedCost}
        />
      )}
      {tier2.cachedTokens > 0 && (
        <StatRow
          tokens={tier2.cachedTokens}
          type="Cached (Tier 2)"
          rate={`${(pricing.large_prompt.cached * 1000000).toFixed(3)}/M`}
          cost={tier2.cachedCost}
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
