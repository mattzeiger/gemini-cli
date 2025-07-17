/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { Colors } from '../colors.js';
import { formatDuration } from '../utils/formatters.js';
import { useSessionStats, ModelMetrics } from '../contexts/SessionContext.js';
import {
  getStatusColor,
  TOOL_SUCCESS_RATE_HIGH,
  TOOL_SUCCESS_RATE_MEDIUM,
  USER_AGREEMENT_RATE_HIGH,
  USER_AGREEMENT_RATE_MEDIUM,
} from '../utils/displayUtils.js';
import { CostBreakdownTable } from './CostBreakdownTable.js';
import { costState } from '../../state/costState.js';
import {
  computeSessionStats,
  TieredCostSummary,
} from '../utils/computeStats.js';
import { MODEL_COSTS } from '@google/gemini-cli-core';

// A more flexible and powerful StatRow component
interface StatRowProps {
  title: string;
  children: React.ReactNode; // Use children to allow for complex, colored values
}

const StatRow: React.FC<StatRowProps> = ({ title, children }) => (
  <Box>
    {/* Fixed width for the label creates a clean "gutter" for alignment */}
    <Box width={28}>
      <Text color={Colors.LightBlue}>{title}</Text>
    </Box>
    {children}
  </Box>
);

// A SubStatRow for indented, secondary information
interface SubStatRowProps {
  title: string;
  children: React.ReactNode;
}

const SubStatRow: React.FC<SubStatRowProps> = ({ title, children }) => (
  <Box paddingLeft={2}>
    {/* Adjust width for the "» " prefix */}
    <Box width={26}>
      <Text>» {title}</Text>
    </Box>
    {children}
  </Box>
);

// A Section component to group related stats
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <Box flexDirection="column" width="100%" marginBottom={1}>
    <Text bold>{title}</Text>
    {children}
  </Box>
);

const ModelUsageTable: React.FC<{
  models: Record<string, ModelMetrics>;
  totalCachedTokens: number;
  cacheEfficiency: number;
}> = ({ models, totalCachedTokens, cacheEfficiency }) => {
  const nameWidth = 25;
  const requestsWidth = 8;
  const inputTokensWidth = 15;
  const outputTokensWidth = 15;

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Header */}
      <Box>
        <Box width={nameWidth}>
          <Text bold>Model Usage</Text>
        </Box>
        <Box width={requestsWidth} justifyContent="flex-end">
          <Text bold>Reqs</Text>
        </Box>
        <Box width={inputTokensWidth} justifyContent="flex-end">
          <Text bold>Input Tokens</Text>
        </Box>
        <Box width={outputTokensWidth} justifyContent="flex-end">
          <Text bold>Output Tokens</Text>
        </Box>
      </Box>
      {/* Divider */}
      <Box
        borderStyle="round"
        borderBottom={true}
        borderTop={false}
        borderLeft={false}
        borderRight={false}
        width={nameWidth + requestsWidth + inputTokensWidth + outputTokensWidth}
      ></Box>

      {/* Rows */}
      {Object.entries(models).map(([name, modelMetrics]) => {
        const outputTokens =
          (modelMetrics.tokens.total || 0) -
          (modelMetrics.tokens.prompt || 0) -
          (modelMetrics.tokens.cached || 0);
        const fallbackOutputTokens =
          (modelMetrics.tokens.candidates || 0) +
          (modelMetrics.tokens.thoughts || 0);
        const finalOutputTokens =
          outputTokens > 0 ? outputTokens : fallbackOutputTokens;

        return (
          <Box key={name}>
            <Box width={nameWidth}>
              <Text>{name.replace('-001', '')}</Text>
            </Box>
            <Box width={requestsWidth} justifyContent="flex-end">
              <Text>{modelMetrics.api.totalRequests}</Text>
            </Box>
            <Box width={inputTokensWidth} justifyContent="flex-end">
              <Text color={Colors.AccentYellow}>
                {modelMetrics.tokens.prompt.toLocaleString()}
              </Text>
            </Box>
            <Box width={outputTokensWidth} justifyContent="flex-end">
              <Text color={Colors.AccentYellow}>
                {finalOutputTokens.toLocaleString()}
              </Text>
            </Box>
          </Box>
        );
      })}
      {cacheEfficiency > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text>
            <Text color={Colors.AccentGreen}>Savings Highlight:</Text>{' '}
            {totalCachedTokens.toLocaleString()} ({cacheEfficiency.toFixed(1)}
            %) of input tokens were served from the cache, reducing costs.
          </Text>
          <Box height={1} />
          <Text color={Colors.Gray}>
            » Tip: For a full token breakdown, run `/stats model`.
          </Text>
        </Box>
      )}
    </Box>
  );
};

interface StatsDisplayProps {
  duration: string;
  title?: string;
  cost?: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  duration,
  title,
}) => {
  const { stats } = useSessionStats();
  const { metrics } = stats;
  const { models, tools } = metrics;
  const computed = computeSessionStats(metrics);
  const costBreakdowns = costState.getCostBreakdowns();

  const successThresholds = {
    green: TOOL_SUCCESS_RATE_HIGH,
    yellow: TOOL_SUCCESS_RATE_MEDIUM,
  };
  const agreementThresholds = {
    green: USER_AGREEMENT_RATE_HIGH,
    yellow: USER_AGREEMENT_RATE_MEDIUM,
  };
  const successColor = getStatusColor(computed.successRate, successThresholds);
  const agreementColor = getStatusColor(
    computed.agreementRate,
    agreementThresholds,
  );

  const renderTitle = () => {
    if (title) {
      return Colors.GradientColors && Colors.GradientColors.length > 0 ? (
        <Gradient colors={Colors.GradientColors}>
          <Text bold>{title}</Text>
        </Gradient>
      ) : (
        <Text bold color={Colors.AccentPurple}>
          {title}
        </Text>
      );
    }
    return (
      <Text bold color={Colors.AccentPurple}>
        Session Stats
      </Text>
    );
  };

  let costBreakdownDisplay = null;
  if (costBreakdowns.length > 0) {
    const tieredSummary: TieredCostSummary = {
      tier1: {
        billedInput: 0,
        outputTokens: 0,
        cachedTokens: 0,
        billedInputCost: 0,
        outputCost: 0,
        cachedCost: 0,
      },
      tier2: {
        billedInput: 0,
        outputTokens: 0,
        cachedTokens: 0,
        billedInputCost: 0,
        outputCost: 0,
        cachedCost: 0,
      },
      totalCost: 0,
    };

    for (const breakdown of costBreakdowns) {
      const tier =
        breakdown.pricing.input >
        MODEL_COSTS['gemini-2.5-pro'].small_prompt.input
          ? 'tier2'
          : 'tier1';
      tieredSummary[tier].billedInput += breakdown.billedInput;
      tieredSummary[tier].outputTokens += breakdown.outputTokens;
      tieredSummary[tier].cachedTokens += breakdown.cachedTokens;
      tieredSummary[tier].billedInputCost += breakdown.billedInputCost;
      tieredSummary[tier].outputCost += breakdown.outputCost;
      tieredSummary[tier].cachedCost += breakdown.cachedCost;
      tieredSummary.totalCost += breakdown.totalCost;
    }

    costBreakdownDisplay = (
      <Box flexDirection="column">
        <CostBreakdownTable tieredSummary={tieredSummary} />
        <Box marginTop={1} flexDirection="column">
          <Text color={Colors.Gray}>
            Cached context storage cost is not included. With{' '}
            {computed.totalCachedTokens.toLocaleString()} cached tokens and an
            agent active time of {formatDuration(computed.agentActiveTime)}, the
            estimated maximum storage cost is $
            {(
              (computed.totalCachedTokens / 1000000) *
              (computed.agentActiveTime / (1000 * 60 * 60)) *
              4.5
            ).toFixed(4)}
            .
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      borderStyle="round"
      borderColor={Colors.Gray}
      flexDirection="column"
      paddingY={1}
      paddingX={2}
    >
      {renderTitle()}
      <Box height={1} />

      {tools.totalCalls > 0 && (
        <Section title="Interaction Summary">
          <StatRow title="Tool Calls:">
            <Text>
              {tools.totalCalls} ({' '}
              <Text color={Colors.AccentGreen}>✔ {tools.totalSuccess}</Text>{' '}
              <Text color={Colors.AccentRed}>✖ {tools.totalFail}</Text> )
            </Text>
          </StatRow>
          <StatRow title="Success Rate:">
            <Text color={successColor}>{computed.successRate.toFixed(1)}%</Text>
          </StatRow>
          {computed.totalDecisions > 0 && (
            <StatRow title="User Agreement:">
              <Text color={agreementColor}>
                {computed.agreementRate.toFixed(1)}%{' '}
                <Text color={Colors.Gray}>
                  ({computed.totalDecisions} reviewed)
                </Text>
              </Text>
            </StatRow>
          )}
        </Section>
      )}

      <Section title="Performance">
        <StatRow title="Wall Time:">
          <Text>{duration}</Text>
        </StatRow>
        <StatRow title="Agent Active:">
          <Text>{formatDuration(computed.agentActiveTime)}</Text>
        </StatRow>
        <SubStatRow title="API Time:">
          <Text>
            {formatDuration(computed.totalApiTime)}{' '}
            <Text color={Colors.Gray}>
              ({computed.apiTimePercent.toFixed(1)}%)
            </Text>
          </Text>
        </SubStatRow>
        <SubStatRow title="Tool Time:">
          <Text>
            {formatDuration(computed.totalToolTime)}{' '}
            <Text color={Colors.Gray}>
              ({computed.toolTimePercent.toFixed(1)}%)
            </Text>
          </Text>
        </SubStatRow>
      </Section>

      {Object.keys(models).length > 0 && (
        <ModelUsageTable
          models={models}
          totalCachedTokens={computed.totalCachedTokens}
          cacheEfficiency={computed.cacheEfficiency}
        />
      )}

      {costBreakdownDisplay}
    </Box>
  );
};
