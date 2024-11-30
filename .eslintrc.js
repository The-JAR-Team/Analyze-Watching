module.exports = {
    "env": {
      "browser": true,
      "es2021": true,
      "jest": true
    },
    "extends": [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended"
    ],
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "plugins": [
      "react",
      "react-hooks"
    ],
    "rules": {
      // Example custom rules
      "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
      "react/prop-types": "off", // Disable prop-types as we use TypeScript or prefer not to use prop-types
      // Add any other custom rules here
    },
    "settings": {
      "react": {
        "version": "detect" // Automatically detect the React version
      }
    }
  };
  