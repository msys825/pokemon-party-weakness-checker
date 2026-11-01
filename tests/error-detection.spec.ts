import { test, expect } from '@playwright/test';

/**
 * コンソールエラーを検出するテスト
 * 実際のエラーを詳細に記録して、修正可能にする
 */
test('コンソールエラーがないことを確認', async ({ page }) => {
  const errors: Array<{ type: string; message: string; url?: string; stack?: string }> = [];
  const warnings: string[] = [];
  const failedRequests: Array<{ url: string; status: number; statusText: string }> = [];
  
  // コンソールエラーと警告をキャッチ
  page.on('console', msg => {
    const text = msg.text();
    const location = msg.location();
    
    if (msg.type() === 'error') {
      // 404エラーやfaviconエラーは無視
      if (!text.includes('404') && !text.includes('favicon') && !text.includes('Failed to load resource')) {
        errors.push({
          type: 'console.error',
          message: text,
          url: location.url,
          stack: location.url ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : undefined,
        });
      }
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  // ページエラーをキャッチ
  page.on('pageerror', error => {
    errors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
    });
  });
  
  // リクエストエラーをキャッチ
  page.on('requestfailed', request => {
    const url = request.url();
    const failure = request.failure();
    
    // 404エラーやfaviconエラーは無視
    if (!url.includes('favicon') && failure) {
      failedRequests.push({
        url: url,
        status: 0,
        statusText: failure.errorText || 'Unknown',
      });
    }
  });
  
  // 重要なエラー（500など）は記録（requestfailed では HTTP ステータスを取得できないため response で検出）
  page.on('response', response => {
    if (response.status() >= 500) {
      errors.push({
        type: 'requestfailed',
        message: `Failed request: ${response.url()} (${response.status()})`,
        url: response.url(),
      });
    }
  });
  
  // ページにアクセス
  await page.goto('/');
  
  // 少し待ってからエラーを確認
  await page.waitForTimeout(2000);
  
  // エラーを詳細に記録
  if (errors.length > 0) {
    console.error('\n=== 検出されたエラー ===');
    errors.forEach((error, index) => {
      console.error(`\n[${index + 1}] ${error.type}: ${error.message}`);
      if (error.url) console.error(`    URL: ${error.url}`);
      if (error.stack) console.error(`    Stack: ${error.stack}`);
    });
    console.error('\n=== エラー詳細終了 ===\n');
  }
  
  if (failedRequests.length > 0) {
    console.warn('\n=== 失敗したリクエスト ===');
    failedRequests.forEach((req, index) => {
      console.warn(`[${index + 1}] ${req.url} - ${req.status} ${req.statusText}`);
    });
    console.warn('\n=== 失敗したリクエスト終了 ===\n');
  }
  
  // エラーがないことを確認
  expect(errors).toHaveLength(0);
});

/**
 * CSSが正しく読み込まれていることを確認するテスト
 */
test('CSSが正しく読み込まれていることを確認', async ({ page }) => {
  await page.goto('/');
  
  // CSSファイルが読み込まれているか確認
  const cssLoaded = await page.evaluate(() => {
    const stylesheets = Array.from(document.styleSheets);
    return stylesheets.length > 0;
  });
  
  expect(cssLoaded).toBe(true);
  
  // コンテナのスタイルが適用されているか確認
  const containerStyle = await page.evaluate(() => {
    const container = document.querySelector('.container');
    if (!container) return null;
    const style = window.getComputedStyle(container);
    return {
      maxWidth: style.maxWidth,
      margin: style.margin,
    };
  });
  
  expect(containerStyle).not.toBeNull();
  // 画面幅に応じて 720px / 1400px / 1600px に切り替わる
  expect(containerStyle?.maxWidth).toMatch(/^(720|1400|1600)px$/);
});

/**
 * テーマ切り替えが正しく動作することを確認するテスト
 */
test('テーマ切り替えが正しく動作することを確認', async ({ page }) => {
  await page.goto('/');
  
  // テーマトグルボタンが存在するか確認
  const themeToggle = page.locator('.theme-toggle');
  await expect(themeToggle).toBeVisible();
  
  const html = page.locator('html');
  const initialDark = await html.evaluate((el) => el.classList.contains('dark'));
  
  // 1クリックでテーマが切り替わることを確認
  await themeToggle.click();
  expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(!initialDark);
  
  // もう1クリックで元に戻ることを確認
  await themeToggle.click();
  expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(initialDark);
});

/**
 * ボタンのクリックが正しく動作することを確認するテスト
 */
test('ボタンのクリックが正しく動作することを確認', async ({ page }) => {
  await page.goto('/');
  
  // 追加ボタンが存在するか確認
  const addButton = page.locator('.add-button');
  await expect(addButton).toBeVisible();
  
  // 追加ボタンをクリック
  await addButton.click();
  
  // メンバーが追加されることを確認（少し待つ）
  await page.waitForTimeout(500);
  
  // メンバーリストを確認
  const members = page.locator('.pokemon-member');
  const memberCount = await members.count();
  expect(memberCount).toBeGreaterThan(0);
});

