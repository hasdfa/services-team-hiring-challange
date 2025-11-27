export const packageJson = JSON.stringify(
  {
    name: 'preview',
    version: '1.0.0',
    dependencies: {
      react: '19.1.0',
      'react-dom': '19.1.0',
      '@mui/material': '7.3.5',
      '@mui/icons-material': '7.3.5',
      '@emotion/react': '11.14.0',
      '@emotion/styled': '11.14.1',
      // '@mui/x-data-grid': '8.20.0',
      // '@mui/x-date-pickers': '8.20.0',
      // '@mui/x-date-pickers-pro': '8.20.0',
      // '@mui/x-tree-view': '8.20.0',
    },
  },
  null,
  2
);

export const indexhtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="./src/main.js" type="module"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
