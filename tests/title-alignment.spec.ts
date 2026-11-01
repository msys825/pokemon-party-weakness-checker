import { test, expect } from '@playwright/test';

/**
 * タイトルの中央寄せが正しく動作することを確認するテスト
 */
test('タイトルが中央寄せになっていることを確認', async ({ page }) => {
  await page.goto('/');
  
  // タイトル要素を取得
  const title = page.locator('.title');
  await expect(title).toBeVisible();
  
  // タイトルのテキストを確認
  const titleText = await title.textContent();
  expect(titleText).toBe('ポケモン パーティ相性診断');
  
  // タイトルのスタイルを確認
  const titleStyle = await page.evaluate(() => {
    const titleElement = document.querySelector('.title');
    if (!titleElement) return null;
    return window.getComputedStyle(titleElement);
  });
  
  expect(titleStyle).not.toBeNull();
  expect(titleStyle?.textAlign).toBe('center');
  
  // ヘッダーコンテンツのスタイルを確認
  const headerContentStyle = await page.evaluate(() => {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return null;
    return window.getComputedStyle(headerContent);
  });
  
  expect(headerContentStyle).not.toBeNull();
  expect(headerContentStyle?.justifyContent).toBe('center');
  expect(headerContentStyle?.position).toBe('relative');
});

