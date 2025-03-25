# Next.js iPad Dashboard

This project is a web-based dashboard designed specifically for the iPad (4th generation) running iOS 10. It utilizes Next.js to provide a responsive and user-friendly interface.

## Project Structure

```
nextjs-ipad-dashboard
├── src
│   ├── components
│   │   ├── Dashboard.tsx
│   │   └── Layout.tsx
│   ├── pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── api
│   │   │   └── data.ts
│   │   └── index.tsx
│   ├── styles
│   │   ├── globals.css
│   │   └── Home.module.css
│   └── utils
│       └── helpers.ts
├── public
│   └── favicon.ico
├── .browserslistrc
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Responsive Design**: The dashboard is optimized for the iPad's screen size.
- **Component-Based Architecture**: Utilizes React components for modular development.
- **API Integration**: Includes an API route to fetch data dynamically.
- **Global and Scoped Styles**: Supports both global styles and CSS modules for component-specific styling.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nextjs-ipad-dashboard
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the dashboard.

## Usage

- The main dashboard interface is rendered by the `Dashboard` component located in `src/components/Dashboard.tsx`.
- The layout structure is managed by the `Layout` component in `src/components/Layout.tsx`.
- Global styles can be modified in `src/styles/globals.css`, while component-specific styles can be found in `src/styles/Home.module.css`.

## Compatibility

This project is configured to support Safari 10, ensuring functionality on the iPad (4th generation). The `.browserslistrc` file includes the necessary settings for compatibility.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.