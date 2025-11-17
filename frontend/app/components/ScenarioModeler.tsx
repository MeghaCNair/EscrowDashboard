'use client';

import { useMemo, useState } from 'react';
import { EscrowData } from '../types/escrow';

const CUSHION_MONTHS = 2;

interface ScenarioModelerProps {
  records: EscrowData[];
}

type RiskFilter = 'all' | 'high' | 'medium' | 'low';

function getRiskTier(shortage: number): RiskFilter {
  if (shortage > 4000) return 'high';
  if (shortage > 2000) return 'medium';
  if (shortage > 0) return 'low';
  return 'low';
}

export default function ScenarioModeler({ records }: ScenarioModelerProps) {
  const [taxDelta, setTaxDelta] = useState(5);
  const [insuranceDelta, setInsuranceDelta] = useState(3);
  const [contributionDelta, setContributionDelta] = useState(5);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');

  const filteredRecords = useMemo(() => {
    if (riskFilter === 'all') return records;
    return records.filter((record) => getRiskTier(record['Forecasted Escrow Shortage']) === riskFilter);
  }, [records, riskFilter]);

  const scenario = useMemo(() => {
    let baselineShortage = 0;
    let scenarioShortage = 0;
    let baselineSurplus = 0;
    let scenarioSurplus = 0;

    const countyImpact: Record<string, { baseline: number; scenario: number }> = {};

    filteredRecords.forEach((record) => {
      const baseShort = record['Forecasted Escrow Shortage'];
      const baseSurplus = record['Forecasted Escrow Surplus'];

      const adjustedTax = record['Forecasted Tax'] * (1 + taxDelta / 100);
      const adjustedInsurance = record['Forecasted Insurance'] * (1 + insuranceDelta / 100);
      const annualOutflow = adjustedTax + adjustedInsurance;
      const monthlyContribution = annualOutflow / 12;
      const adjustedBalance = record['Current Escrow Balance'] * (1 + contributionDelta / 100);
      const requiredBalance = annualOutflow + monthlyContribution * CUSHION_MONTHS;
      const gap = adjustedBalance - requiredBalance;

      const scenarioShort = gap < 0 ? -gap : 0;
      const scenarioSurp = gap > 0 ? gap : 0;

      baselineShortage += baseShort;
      scenarioShortage += scenarioShort;
      baselineSurplus += baseSurplus;
      scenarioSurplus += scenarioSurp;

      if (!countyImpact[record.County]) {
        countyImpact[record.County] = { baseline: 0, scenario: 0 };
      }
      countyImpact[record.County].baseline += baseShort;
      countyImpact[record.County].scenario += scenarioShort;
    });

    return {
      baselineShortage,
      scenarioShortage,
      baselineSurplus,
      scenarioSurplus,
      countyImpact,
    };
  }, [filteredRecords, taxDelta, insuranceDelta, contributionDelta]);

  const shortageDelta = scenario.scenarioShortage - scenario.baselineShortage;
  const surplusDelta = scenario.scenarioSurplus - scenario.baselineSurplus;

  const countyEntries = Object.entries(scenario.countyImpact)
    .map(([county, values]) => ({
      county,
      baseline: values.baseline,
      scenario: values.scenario,
      difference: values.scenario - values.baseline,
    }))
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
    .slice(0, 6);

  return (
    <section className="section-wrapper bg-white/85 px-6 sm:px-8 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScenarioCard
          title="Baseline shortage"
          value={`$${scenario.baselineShortage.toLocaleString('en-US')}`}
          description="Current forecast across selected borrowers"
          tone="critical"
        />
        <ScenarioCard
          title="Scenario shortage"
          value={`$${scenario.scenarioShortage.toLocaleString('en-US')}`}
          description="After applying adjustments"
          tone={scenario.scenarioShortage <= scenario.baselineShortage ? 'success' : 'critical'}
        />
        <ScenarioCard
          title="Shortage delta"
          value={`${shortageDelta >= 0 ? '+' : '-'}$${Math.abs(shortageDelta).toLocaleString('en-US')}`}
          description={shortageDelta >= 0 ? 'Additional funding required' : 'Potential shortage avoided'}
          tone={shortageDelta >= 0 ? 'critical' : 'success'}
        />
        <ScenarioCard
          title="Surplus delta"
          value={`${surplusDelta >= 0 ? '+' : '-'}$${Math.abs(surplusDelta).toLocaleString('en-US')}`}
          description={surplusDelta >= 0 ? 'Excess escrow created' : 'Surplus consumed'}
          tone={surplusDelta >= 0 ? 'info' : 'warning'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ControlGroup
          label="Tax projection"
          description="Adjust future property tax movements"
        >
          <Slider
            value={taxDelta}
            min={-10}
            max={20}
            step={1}
            onChange={setTaxDelta}
            suffix="%"
          />
        </ControlGroup>

        <ControlGroup
          label="Insurance projection"
          description="Adjust annual insurance premium changes"
        >
          <Slider
            value={insuranceDelta}
            min={-10}
            max={20}
            step={1}
            onChange={setInsuranceDelta}
            suffix="%"
          />
        </ControlGroup>

        <ControlGroup
          label="Escrow contributions"
          description="Increase annual contributions to offset shortage"
        >
          <Slider
            value={contributionDelta}
            min={-10}
            max={25}
            step={1}
            onChange={setContributionDelta}
            suffix="%"
          />
        </ControlGroup>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1">
          <ControlGroup
            label="Risk segment"
            description="Model impact for a specific borrower cohort"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'high', label: 'High risk' },
                { key: 'medium', label: 'Medium risk' },
                { key: 'low', label: 'Low risk' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setRiskFilter(option.key as RiskFilter)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${{
                    true: 'bg-[#ffebee] border-[#f6d5d5] text-[#c62828]',
                    false: 'bg-white border-gray-200 text-gray-600 hover:border-[#d32f2f]/40 hover:text-[#d32f2f]',
                  }[String(riskFilter === option.key) as 'true' | 'false']}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </ControlGroup>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm h-full">
            <h4 className="text-sm font-semibold text-slate-900">Key takeaways</h4>
            <ul className="mt-3 text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>
                A {taxDelta}% change to property taxes shifts shortage exposure by{' '}
                <strong>{`${shortageDelta >= 0 ? '+' : '-'}$${Math.abs(shortageDelta).toLocaleString('en-US')}`}</strong> across the
                selected cohort.
              </li>
              <li>
                Adjusting contributions by {contributionDelta}% results in{' '}
                <strong>{`${surplusDelta >= 0 ? 'additional surplus of' : 'using up'} $${Math.abs(surplusDelta).toLocaleString('en-US')}`}</strong>.
              </li>
              <li>
                Focus on counties with the largest shortage increase below to pre-empt borrower outreach.
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Top impacted counties</h4>
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="py-2 text-left">County</th>
                  <th className="py-2 text-right">Baseline shortage</th>
                  <th className="py-2 text-right">Scenario shortage</th>
                  <th className="py-2 text-right">Δ Shortage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {countyEntries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-gray-500">
                      No shortage exposure for the selected scenario.
                    </td>
                  </tr>
                ) : (
                  countyEntries.map((entry) => (
                    <tr key={entry.county} className="hover:bg-[#fffbf7] transition-colors">
                      <td className="py-2 text-gray-700 font-medium">{entry.county}</td>
                      <td className="py-2 text-right text-gray-600">${entry.baseline.toLocaleString('en-US')}</td>
                      <td className="py-2 text-right text-gray-600">${entry.scenario.toLocaleString('en-US')}</td>
                      <td className={`py-2 text-right font-semibold ${entry.difference >= 0 ? 'text-[#c62828]' : 'text-[#2e7d32]'}`}>
                        {entry.difference >= 0 ? '+' : '-'}${Math.abs(entry.difference).toLocaleString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ScenarioCardProps {
  title: string;
  value: string;
  description: string;
  tone?: 'critical' | 'success' | 'warning' | 'info';
}

function ScenarioCard({ title, value, description, tone = 'info' }: ScenarioCardProps) {
  const palettes: Record<typeof tone, string> = {
    critical: 'bg-gradient-to-br from-[#ffebee] via-[#fff1f1] to-white border-[#ffcdd2] text-[#c62828]',
    success: 'bg-gradient-to-br from-[#e8f5e9] via-[#f3faf4] to-white border-[#c8e6c9] text-[#2e7d32]',
    warning: 'bg-gradient-to-br from-[#fff8e1] via-[#fff3d1] to-white border-[#ffe8b3] text-[#ef6c00]',
    info: 'bg-gradient-to-br from-[#e3f2fd] via-[#eef6ff] to-white border-[#bbdefb] text-[#1565c0]',
  };

  const palette = palettes[tone];

  return (
    <div className={`rounded-2xl border ${palette} px-5 py-4 shadow-sm flex flex-col gap-2`}> 
      <span className="text-xs uppercase tracking-wide opacity-75">{title}</span>
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-sm text-gray-600">{description}</span>
    </div>
  );
}

interface ControlGroupProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function ControlGroup({ label, description, children }: ControlGroupProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        {description ? <p className="text-xs text-gray-500 mt-1">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function Slider({ value, min, max, step, suffix, onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{min}{suffix}</span>
        <span className="text-sm font-semibold text-[#d32f2f]">{value}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#d32f2f]"
      />
    </div>
  );
}
