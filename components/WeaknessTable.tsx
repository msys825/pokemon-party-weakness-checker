'use client';

import { PokemonType } from '@/lib/types';
import { POKEMON_TYPES } from '@/lib/pokemonTypes';
import { WeaknessResult } from '@/lib/calculator';
import { COLORS } from '@/lib/constants';

interface WeaknessTableProps {
  weaknesses: Map<PokemonType, WeaknessResult>;
}

const MIN_VALUE = -10;
const MAX_VALUE = 10;
const ZERO_VALUE = 0;

const LONG_TYPE_NAMES: PokemonType[] = ['フェアリー', 'エスパー', 'ゴースト', 'ドラゴン'];

function getColorForValue(value: number): string {
  const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));

  if (clampedValue === ZERO_VALUE) {
    return `rgb(${COLORS.WHITE.r}, ${COLORS.WHITE.g}, ${COLORS.WHITE.b})`;
  }

  if (clampedValue > ZERO_VALUE) {
    const normalized = (clampedValue - ZERO_VALUE) / (MAX_VALUE - ZERO_VALUE);
    const adjustedNormalized = Math.pow(normalized, 0.7);
    const r = Math.round(COLORS.WHITE.r + (COLORS.BLUE.r - COLORS.WHITE.r) * adjustedNormalized);
    const g = Math.round(COLORS.WHITE.g + (COLORS.BLUE.g - COLORS.WHITE.g) * adjustedNormalized);
    const b = Math.round(COLORS.WHITE.b + (COLORS.BLUE.b - COLORS.WHITE.b) * adjustedNormalized);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const normalized = (ZERO_VALUE - clampedValue) / (ZERO_VALUE - MIN_VALUE);
  const adjustedNormalized = Math.pow(normalized, 0.7);
  const r = Math.round(COLORS.WHITE.r + (COLORS.RED.r - COLORS.WHITE.r) * adjustedNormalized);
  const g = Math.round(COLORS.WHITE.g + (COLORS.RED.g - COLORS.WHITE.g) * adjustedNormalized);
  const b = Math.round(COLORS.WHITE.b + (COLORS.RED.b - COLORS.WHITE.b) * adjustedNormalized);
  return `rgb(${r}, ${g}, ${b})`;
}

const LEGEND_GRADIENT = `linear-gradient(to right, rgb(${COLORS.RED.r}, ${COLORS.RED.g}, ${COLORS.RED.b}), rgb(${COLORS.WHITE.r}, ${COLORS.WHITE.g}, ${COLORS.WHITE.b}), rgb(${COLORS.BLUE.r}, ${COLORS.BLUE.g}, ${COLORS.BLUE.b}))`;

// 1匹あたりの相性スコア（lib/calculator.ts の effectivenessToScore と対応）
const SCORE_GUIDE = [
  { score: 4, label: '効果なし', damage: '0倍' },
  { score: 3, label: 'いまひとつ（重複）', damage: '1/4倍' },
  { score: 2, label: 'いまひとつ', damage: '1/2倍' },
  { score: 0, label: '通常', damage: '1倍' },
  { score: -2, label: '効果ばつぐん', damage: '2倍' },
  { score: -4, label: '効果ばつぐん（重複）', damage: '4倍' },
] as const;

function formatValue(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toFixed(2).replace(/\.?0+$/, '');
}

export default function WeaknessTable({ weaknesses }: WeaknessTableProps) {
  return (
    <div className="weakness-table-container">
      <h2 className="weakness-table-title">タイプ耐性一覧</h2>
      <div className="weakness-table-grid">
        {POKEMON_TYPES.map((type) => {
          const result = weaknesses.get(type) || { totalValue: 0 };
          const { totalValue } = result;
          const backgroundColor = getColorForValue(totalValue);
          const textColor =
            totalValue >= MAX_VALUE || totalValue <= MIN_VALUE
              ? COLORS.TEXT_LIGHT
              : COLORS.TEXT_DARK;

          return (
            <div
              key={type}
              className="weakness-cell"
              style={{
                backgroundColor,
                color: textColor,
              }}
            >
              <div
                className="weakness-type-name"
                style={{
                  color: textColor,
                  fontSize: LONG_TYPE_NAMES.includes(type) ? '0.8125rem' : '0.9375rem',
                }}
              >
                {type}
              </div>
              <div
                className="weakness-value"
                style={{ color: textColor }}
              >
                {formatValue(totalValue)}
              </div>
            </div>
          );
        })}
      </div>
      <section className="explanation-section" aria-label="表の見かた">
        <div className="explanation-highlight">
          <h3 className="explanation-lead">色を見るだけで、パーティの守りの強さがひと目でわかります</h3>
          <div className="explanation-legend" aria-hidden="true">
            <div className="explanation-legend-bar" style={{ background: LEGEND_GRADIENT }} />
            <div className="explanation-legend-labels">
              <span className="legend-weak">← 弱点が多い</span>
              <span>通常</span>
              <span className="legend-resist">耐性が高い →</span>
            </div>
          </div>
          <ul className="explanation-points">
            <li>
              表全体が<strong className="legend-resist">青い</strong>ほど、多くのタイプの攻撃に強い、耐性の高いパーティです。
            </li>
            <li>
              <strong className="legend-weak">赤い</strong>マスが多いほど、弱点を突かれやすいパーティです。色が濃いほど、そのタイプへの弱点が集中しています。
            </li>
          </ul>
          <p className="explanation-text">
            赤いマスを減らし、青いマスを増やすようにメンバーを入れ替えれば、お互いの弱点を補い合うバランスの良いパーティを組めます。迷ったときは「提案」ボタンで、弱点を補うタイプを探してみてください。
          </p>
        </div>

        <div className="score-guide">
          <h3 className="score-guide-title">数値の計算方法</h3>
          <p className="score-guide-desc">
            各マスの数値は、そのタイプの攻撃を受けたときの相性スコアを、パーティ全員分<strong>合計</strong>したものです。
            <strong className="legend-resist">プラス（青）</strong>は耐性、
            <strong className="legend-weak">マイナス（赤）</strong>は弱点を表します。
          </p>

          <table className="score-table">
            <caption className="score-table-caption">1匹あたりの相性スコア</caption>
            <thead>
              <tr>
                <th scope="col">スコア</th>
                <th scope="col">相性</th>
                <th scope="col">ダメージ</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_GUIDE.map(({ score, label, damage }) => (
                <tr key={score}>
                  <td>
                    <span
                      className="score-chip"
                      style={{ backgroundColor: getColorForValue(score) }}
                    >
                      {score > 0 ? `+${score}` : score}
                    </span>
                  </td>
                  <td className="score-label">{label}</td>
                  <td className="score-damage">{damage}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="score-example">
            <p className="score-example-title">計算例</p>
            <p className="score-example-body">
              ほのおタイプとみずタイプの2匹で、<strong>くさ</strong>タイプの攻撃を受ける場合
            </p>
            <p className="score-example-formula">
              <span className="score-term">
                ほのお <span className="legend-resist">+2</span>（いまひとつ）
              </span>{' '}
              <span className="score-term">
                ＋ みず <span className="legend-weak">-2</span>（効果ばつぐん）
              </span>{' '}
              <span className="score-term">
                ＝ <strong>0</strong>
              </span>
            </p>
            <p className="score-example-note">
              片方の弱点をもう片方の耐性が打ち消し、プラスマイナス0になります。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

