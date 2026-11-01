import { test, expect } from '@playwright/test';

/**
 * Hydrationエラーの検出テスト
 * サーバーサイドとクライアントサイドのレンダリングの不一致を検出
 */
test.describe('Hydrationエラーの検出', () => {
  test('ページが正常に読み込まれ、Hydrationエラーが発生しない', async ({ page }) => {
    const errors: string[] = [];
    
    // コンソールエラーを記録
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('hydration')) {
          errors.push(text);
        }
      }
    });
    
    // ページエラーを記録
    page.on('pageerror', (error) => {
      if (error.message.includes('Hydration') || error.message.includes('hydration')) {
        errors.push(error.message);
      }
    });
    
    // ページにアクセス
    await page.goto('/');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 少し待機してエラーが発生する時間を与える
    await page.waitForTimeout(1000);
    
    // Hydrationエラーが発生していないことを確認
    expect(errors.length).toBe(0);
    
    // ページが正常に表示されていることを確認
    await expect(page.locator('h1.title')).toBeVisible();
    await expect(page.locator('.container')).toBeVisible();
  });

  test('リロード後もHydrationエラーが発生しない', async ({ page }) => {
    const errors: string[] = [];
    
    // コンソールエラーを記録
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('hydration')) {
          errors.push(text);
        }
      }
    });
    
    // ページエラーを記録
    page.on('pageerror', (error) => {
      if (error.message.includes('Hydration') || error.message.includes('hydration')) {
        errors.push(error.message);
      }
    });
    
    // ページにアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // リロード
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Hydrationエラーが発生していないことを確認
    expect(errors.length).toBe(0);
  });

  test('テーマ切り替え後もHydrationエラーが発生しない', async ({ page }) => {
    const errors: string[] = [];
    
    // コンソールエラーを記録
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('Hydration') || text.includes('hydration')) {
          errors.push(text);
        }
      }
    });
    
    // ページにアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // テーマトグルボタンをクリックしてテーマを切り替え
    await page.locator('.theme-toggle').click();
    await page.waitForTimeout(1000);
    
    // Hydrationエラーが発生していないことを確認
    expect(errors.length).toBe(0);
  });
});

