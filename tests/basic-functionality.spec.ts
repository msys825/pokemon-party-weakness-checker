import { test, expect } from '@playwright/test';

/**
 * 基本的な機能の動作確認テスト
 * CSS読み込み、クリック動作、フォーム入力などを確認
 */
test.describe('基本的な機能の動作確認', () => {
  test('ページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/');
    
    // タイトルが表示されているか
    await expect(page.locator('h1.title')).toContainText('ポケモン パーティ相性診断');
    
    // コンテナが存在するか
    await expect(page.locator('.container')).toBeVisible();
  });

  test('CSSが正しく適用されている', async ({ page }) => {
    await page.goto('/');
    
    // 背景色を確認
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // 背景色が設定されているか（ライト: #ffffff / ダーク: #1a1a1a）
    expect(bodyBg).toMatch(/rgb\(255, 255, 255\)|rgb\(26, 26, 26\)/);
    
    // コンテナのスタイルを確認
    const containerStyle = await page.locator('.container').evaluate((el) => {
      return window.getComputedStyle(el).maxWidth;
    });
    // 画面幅に応じて 720px / 1400px / 1600px に切り替わる
    expect(containerStyle).toMatch(/^(720|1400|1600)px$/);
  });

  test('追加ボタンがクリックできる', async ({ page }) => {
    await page.goto('/');
    
    // 初期状態のメンバー数を取得
    const initialCount = await page.locator('.pokemon-member').count();
    
    // 追加ボタンをクリック
    await page.locator('.add-button').click();
    
    // メンバーが追加されたか確認
    await expect(page.locator('.pokemon-member')).toHaveCount(initialCount + 1);
  });

  test('提案ボタンがクリックできる', async ({ page }) => {
    await page.goto('/');
    
    // 初期状態のメンバー数を取得
    const initialCount = await page.locator('.pokemon-member').count();
    
    // 提案ボタンをクリック
    await page.locator('.suggest-button').click();
    
    // メンバーが追加されたか確認（提案が成功した場合）
    const newCount = await page.locator('.pokemon-member').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('テーマトグルボタンがクリックできる', async ({ page }) => {
    await page.goto('/');
    
    const isDark = () => page.locator('html').evaluate((el) => el.classList.contains('dark'));
    const initialDark = await isDark();
    
    // 1クリックでテーマが切り替わる
    await page.locator('.theme-toggle').click();
    expect(await isDark()).toBe(!initialDark);
    
    // 再読み込みしても選択が維持される
    await page.reload();
    expect(await isDark()).toBe(!initialDark);
    
    // もう1クリックで元に戻る
    await page.locator('.theme-toggle').click();
    expect(await isDark()).toBe(initialDark);
  });

  test('タイプ選択が動作する', async ({ page }) => {
    await page.goto('/');
    
    // 最初のメンバーのタイプ1セレクトを取得
    const type1Select = page.locator('.pokemon-member').first().locator('select').first();
    
    // タイプを選択
    await type1Select.selectOption('ほのお');
    
    // 選択が反映されたか確認
    await expect(type1Select).toHaveValue('ほのお');
  });

  test('表の見かたが常に表示されている', async ({ page }) => {
    await page.goto('/');
    
    // 折りたたまずに最初から表示されているか確認
    await expect(page.locator('.explanation-highlight')).toBeVisible();
    await expect(page.locator('.score-guide')).toBeVisible();
    
    // スコア表に6段階すべてが表示されているか確認
    await expect(page.locator('.score-table tbody tr')).toHaveCount(6);
  });

  test('弱点表が表示される', async ({ page }) => {
    await page.goto('/');
    
    // 弱点表のタイトルが表示されているか
    await expect(page.locator('.weakness-table-title')).toContainText('タイプ耐性一覧');
    
    // 弱点セルが存在するか（18タイプ分）
    const cells = await page.locator('.weakness-cell').count();
    expect(cells).toBe(18);
  });
});

