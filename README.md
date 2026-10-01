# 圖片轉 PDF

手機優先的小工具：上傳多張圖片、長按調整順序，一鍵合成 A4 的 PDF。全程在瀏覽器內處理，圖片不會上傳到任何伺服器。

- 每張圖一頁 A4 直式，高度先調成 29 公分並保持長寬比；寬度超過 21 公分時等比縮小到頁寬
- 橫式照片會自動旋轉 90°，讓長邊沿著 29 公分
- 長按卡片拖曳排序，每張可旋轉或刪除

## 開發

```bash
pnpm install
pnpm dev      # 區網網址可用手機開啟
pnpm build
```

技術：Vue 3、Vite、vuedraggable、jsPDF。推到 `main` 會由 GitHub Actions 自動部署到 GitHub Pages。
