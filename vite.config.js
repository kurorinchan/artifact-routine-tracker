import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pagesでプロジェクトをデプロイするために、ベースパスを設定します。
  // ここでは、リポジトリ名と同じパスを使用します。
  base: '/artifact-routine-tracker/',
  plugins: [react()],
});