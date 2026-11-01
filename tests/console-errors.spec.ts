import { test, expect } from '@playwright/test';

/**
 * コンソールエラーを詳細に記録して、修正可能にするテスト
 * このテストは、実際のブラウザで発生しているエラーをすべて記録します
 * 
 * 使用方法:
 * BASE_URL=http://localhost:3001 npx playwright test tests/console-errors.spec.ts
 */
test('すべてのコンソールエラーを記録', async ({ page, baseURL }) => {
  const allErrors: Array<{
    type: string;
    message: string;
    url?: string;
    stack?: string;
    timestamp: string;
  }> = [];
  
  const allWarnings: Array<{
    message: string;
    url?: string;
    timestamp: string;
  }> = [];
  
  const allFailedRequests: Array<{
    url: string;
    status: number;
    statusText: string;
    timestamp: string;
  }> = [];
  
  // コンソールメッセージをすべて記録
  page.on('console', msg => {
    const text = msg.text();
    const location = msg.location();
    const timestamp = new Date().toISOString();
    
    if (msg.type() === 'error') {
      allErrors.push({
        type: 'console.error',
        message: text,
        url: location.url,
        stack: location.url ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : undefined,
        timestamp,
      });
    } else if (msg.type() === 'warning') {
      allWarnings.push({
        message: text,
        url: location.url,
        timestamp,
      });
    }
  });
  
  // ページエラーを記録
  page.on('pageerror', error => {
    allErrors.push({
      type: 'pageerror',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  });
  
  // リクエストエラーを記録
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure) {
      allFailedRequests.push({
        url: request.url(),
        status: 0,
        statusText: failure.errorText || 'Unknown',
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  // ページにアクセス（baseURLが設定されている場合はそれを使用）
  const targetURL = baseURL || process.env.BASE_URL || 'http://localhost:3000';
  await page.goto(targetURL);
  
  // インタラクションを実行してエラーを検出
  await page.waitForTimeout(1000);
  
  // テーマトグルボタンをクリック
  try {
    await page.locator('.theme-toggle').click();
    await page.waitForTimeout(500);
    await page.locator('.theme-toggle').click();
  } catch (e) {
    // エラーは記録される
  }
  
  // 追加ボタンをクリック
  try {
    await page.locator('.add-button').click();
    await page.waitForTimeout(500);
  } catch (e) {
    // エラーは記録される
  }
  
  // エラーを詳細に出力
  console.log('\n' + '='.repeat(80));
  console.log('コンソールエラー詳細レポート');
  console.log('='.repeat(80));
  
  if (allErrors.length > 0) {
    console.log(`\n❌ エラー: ${allErrors.length}件\n`);
    allErrors.forEach((error, index) => {
      console.log(`[${index + 1}] ${error.type}`);
      console.log(`    メッセージ: ${error.message}`);
      if (error.url) console.log(`    URL: ${error.url}`);
      if (error.stack) console.log(`    スタック: ${error.stack}`);
      console.log(`    時刻: ${error.timestamp}`);
      console.log('');
    });
  } else {
    console.log('\n✅ エラーは検出されませんでした\n');
  }
  
  if (allWarnings.length > 0) {
    console.log(`\n⚠️  警告: ${allWarnings.length}件\n`);
    allWarnings.forEach((warning, index) => {
      console.log(`[${index + 1}] ${warning.message}`);
      if (warning.url) console.log(`    URL: ${warning.url}`);
      console.log(`    時刻: ${warning.timestamp}`);
      console.log('');
    });
  }
  
  if (allFailedRequests.length > 0) {
    console.log(`\n🔴 失敗したリクエスト: ${allFailedRequests.length}件\n`);
    allFailedRequests.forEach((req, index) => {
      console.log(`[${index + 1}] ${req.url}`);
      console.log(`    ステータス: ${req.status} ${req.statusText}`);
      console.log(`    時刻: ${req.timestamp}`);
      console.log('');
    });
  }
  
  console.log('='.repeat(80) + '\n');
  
  // エラーレポートをファイルに保存（オプション）
  // この情報を使ってエラーを修正できます
});

