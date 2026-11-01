'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { usePokemonParty } from '@/hooks/usePokemonParty';
import { calculatePartyWeaknesses } from '@/lib/calculator';
import { suggestPokemonType } from '@/lib/suggestion';
import PokemonMember from '@/components/PokemonMember';
import WeaknessTable from '@/components/WeaknessTable';
import ThemeSelector from '@/components/ThemeSelector';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

export default function TestPage() {
  const { theme, setTheme, mounted } = useTheme();
  const { party, addMember, removeMember, updateMember } = usePokemonParty();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const weaknesses = useMemo(
    () => calculatePartyWeaknesses(party),
    [party]
  );

  // CSS適用確認
  const testCSS = (): TestResult[] => {
    const results: TestResult[] = [];
    
    // 背景色の確認
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const expectedBg = theme === 'dark' ? 'rgb(26, 26, 26)' : 'rgb(255, 255, 255)';
    const bodyBgRgb = bodyBg.match(/\d+/g)?.slice(0, 3).join(', ');
    results.push({
      name: '背景色の適用',
      status: bodyBg.includes('26, 26, 26') || bodyBg.includes('255, 255, 255') ? 'pass' : 'fail',
      message: `期待: ${expectedBg}, 実際: rgb(${bodyBgRgb})`,
    });

    // コンテナの確認
    const container = document.querySelector('.container');
    if (container) {
      const containerStyle = window.getComputedStyle(container);
      const maxWidth = containerStyle.maxWidth;
      results.push({
        name: 'コンテナのスタイル',
        status: maxWidth === '720px' ? 'pass' : 'fail',
        message: `期待: 720px, 実際: ${maxWidth}`,
      });
    } else {
      results.push({
        name: 'コンテナのスタイル',
        status: 'fail',
        message: 'コンテナ要素が見つかりません',
      });
    }

    // テーマトグルボタンの確認
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      const toggleStyle = window.getComputedStyle(themeToggle);
      const width = toggleStyle.width;
      results.push({
        name: 'テーマトグルボタンのスタイル',
        status: width === '32px' ? 'pass' : 'fail',
        message: `期待: 32px, 実際: ${width}`,
      });
    } else {
      results.push({
        name: 'テーマトグルボタンのスタイル',
        status: 'fail',
        message: 'テーマトグルボタンが見つかりません',
      });
    }

    return results;
  };

  // クリック動作確認
  const testClickEvents = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    // テーマトグルボタンのクリック
    const themeToggle = document.querySelector('.theme-toggle') as HTMLButtonElement;
    if (themeToggle) {
      const initialDark = document.documentElement.classList.contains('dark');
      themeToggle.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      const toggled = document.documentElement.classList.contains('dark') !== initialDark;
      results.push({
        name: 'テーマトグルボタンのクリック',
        status: toggled ? 'pass' : 'fail',
        message: toggled ? 'テーマが切り替わりました' : 'テーマが切り替わりませんでした',
      });
      // 元のテーマに戻す
      if (toggled) {
        themeToggle.click();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      results.push({
        name: 'テーマトグルボタンのクリック',
        status: 'fail',
        message: 'テーマトグルボタンが見つかりません',
      });
    }

    // 追加ボタンのクリック
    const addButton = document.querySelector('.add-button') as HTMLButtonElement;
    if (addButton) {
      const initialPartyLength = party.length;
      addButton.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      const newPartyLength = party.length;
      results.push({
        name: '追加ボタンのクリック',
        status: newPartyLength > initialPartyLength ? 'pass' : 'fail',
        message: `期待: ${initialPartyLength + 1}匹, 実際: ${newPartyLength}匹`,
      });
    } else {
      results.push({
        name: '追加ボタンのクリック',
        status: 'fail',
        message: '追加ボタンが見つかりません',
      });
    }

    // 提案ボタンのクリック
    const suggestButton = document.querySelector('.suggest-button') as HTMLButtonElement;
    if (suggestButton) {
      const initialPartyLength = party.length;
      suggestButton.click();
      await new Promise(resolve => setTimeout(resolve, 200));
      const newPartyLength = party.length;
      results.push({
        name: '提案ボタンのクリック',
        status: newPartyLength > initialPartyLength ? 'pass' : 'fail',
        message: `期待: ${initialPartyLength + 1}匹, 実際: ${newPartyLength}匹`,
      });
    } else {
      results.push({
        name: '提案ボタンのクリック',
        status: 'fail',
        message: '提案ボタンが見つかりません',
      });
    }

    // 表の見かたが常に表示されているか
    const explanationVisible =
      document.querySelector('.explanation-highlight') !== null &&
      document.querySelector('.score-guide') !== null;
    results.push({
      name: '表の見かたの表示',
      status: explanationVisible ? 'pass' : 'fail',
      message: explanationVisible ? '説明が表示されています' : '説明が表示されていません',
    });

    return results;
  };

  // 弱点計算の確認
  const testWeaknessCalculation = (): TestResult[] => {
    const results: TestResult[] = [];
    
    const weaknesses = calculatePartyWeaknesses(party);
    const weaknessCount = weaknesses.size;
    results.push({
      name: '弱点計算の実行',
      status: weaknessCount === 18 ? 'pass' : 'fail',
      message: `期待: 18タイプ, 実際: ${weaknessCount}タイプ`,
    });

    // 提案機能の確認
    const suggestion = suggestPokemonType(party);
    results.push({
      name: '提案機能の実行',
      status: suggestion !== null ? 'pass' : 'fail',
      message: suggestion ? `提案: ${suggestion.type1}${suggestion.type2 ? ` / ${suggestion.type2}` : ''}` : '提案が生成されませんでした',
    });

    return results;
  };

  // すべてのテストを実行
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    const allResults: TestResult[] = [];

    // CSSテスト
    await new Promise(resolve => setTimeout(resolve, 100));
    const cssResults = testCSS();
    allResults.push(...cssResults);
    setResults([...allResults]);

    // クリックイベントテスト
    await new Promise(resolve => setTimeout(resolve, 200));
    const clickResults = await testClickEvents();
    allResults.push(...clickResults);
    setResults([...allResults]);

    // 弱点計算テスト
    await new Promise(resolve => setTimeout(resolve, 100));
    const calcResults = testWeaknessCalculation();
    allResults.push(...calcResults);
    setResults([...allResults]);

    setIsRunning(false);
  };

  useEffect(() => {
    // マウント後に自動実行
    if (mounted) {
      setTimeout(() => {
        runAllTests();
      }, 500);
    }
  }, [mounted]);

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const totalCount = results.length;

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>動作確認テスト</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/" style={{ padding: '0.5rem 1rem', backgroundColor: '#f5f5f5', borderRadius: '4px', textDecoration: 'none', color: '#1a1a1a' }}>
            メインページへ
          </Link>
          <ThemeSelector />
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3ea8ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {isRunning ? 'テスト実行中...' : 'テストを再実行'}
        </button>
      </div>

      {totalCount > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>テスト結果サマリー</h2>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ 成功: {passCount}</span>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ 失敗: {failCount}</span>
            <span style={{ fontWeight: 600 }}>合計: {totalCount}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {results.map((result, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              border: `1px solid ${result.status === 'pass' ? '#22c55e' : result.status === 'fail' ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '4px',
              backgroundColor: result.status === 'pass' ? '#f0fdf4' : result.status === 'fail' ? '#fef2f2' : '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>
                {result.status === 'pass' && '✓'}
                {result.status === 'fail' && '✗'}
                {result.status === 'pending' && '○'}
              </span>
              <span style={{ fontWeight: 600 }}>{result.name}</span>
              <span
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: result.status === 'pass' ? '#22c55e' : result.status === 'fail' ? '#ef4444' : '#9ca3af',
                  color: 'white',
                }}
              >
                {result.status.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginLeft: '1.5rem' }}>
              {result.message}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '4px' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>注意事項</h3>
        <ul style={{ fontSize: '0.875rem', color: '#666', paddingLeft: '1.5rem' }}>
          <li>テストはページ読み込み時に自動実行されます</li>
          <li>クリックイベントのテストは実際にボタンをクリックします</li>
          <li>テスト実行中は操作を控えてください</li>
          <li>失敗したテストがある場合は、ブラウザのコンソールを確認してください</li>
        </ul>
      </div>

      {/* 実際のコンポーネントを表示して動作確認 */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e5e5e5' }}>
        <h2 style={{ marginBottom: '1rem' }}>実際のコンポーネント（動作確認用）</h2>
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            以下のコンポーネントで実際に動作を確認できます。テストページのボタンは、このセクションの要素をテストします。
          </p>
          
          <section className="party-section">
            <h2 className="section-title">パーティメンバー</h2>
            <div className="pokemon-list">
              {party.map((pokemon) => (
                <PokemonMember
                  key={pokemon.id}
                  pokemon={pokemon}
                  party={party}
                  onUpdate={updateMember}
                  onRemove={removeMember}
                  canRemove={party.length > 1}
                  onSuggest={() => {}}
                  continuousClickState={null}
                />
              ))}
            </div>
            <div className="button-group">
              <button
                onClick={() => addMember()}
                className="add-button"
                type="button"
                aria-label="メンバーを追加"
              >
                <span>＋</span>
                <span>追加</span>
              </button>
              <button
                onClick={() => {
                  const suggestion = suggestPokemonType(party);
                  if (suggestion) {
                    addMember(suggestion);
                  }
                }}
                className="suggest-button"
                type="button"
                aria-label="メンバーを提案"
              >
                <span>＋</span>
                <span>提案</span>
              </button>
            </div>
          </section>

          <section className="weakness-section" style={{ marginTop: '1.5rem' }}>
            <WeaknessTable weaknesses={weaknesses} />
          </section>
        </div>
      </div>
    </div>
  );
}

