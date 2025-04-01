# Projects Configuration Guide

This guide explains how to add and customize projects in your portfolio.

## Adding New Projects

### 1. Create Project Files

Create a new folder in the `projects/` directory with your project name (use kebab-case):

```
projects/
└── your-project-name/
    ├── index.html         # Project page content
    └── preview.jpg        # Preview image for portfolio
```

### 2. Modify projects.js

Add your project to the `projectsData` array in `js/projects.js`:

```javascript
const projectsData = [
  // Existing projects...
  {
    id: 'your-project-name',               // Must match folder name
    title: "Your Project Title",           // Display title
    description: "Brief project description that appears on the portfolio page.",
    preview_image: "projects/your-project-name/preview.jpg",
    tags: ["HTML/CSS", "JavaScript"],      // Technologies used
    live_demo: "projects/your-project-name", // Path to project folder
    github_url: "https://github.com/yourusername/your-repo",
  }
];
```

## Preview Image Requirements

For consistent display on the portfolio page:

- **File name**: `preview.jpg` (or update the path in `projectsData`)
- **Dimensions**: 800×450px (16:9 aspect ratio recommended)
- **Format**: JPG or PNG
- **Location**: Inside your project folder

## Project Page Template

Use this basic structure for your project's `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Project Title</title>
    
    <!-- Favicon (Leave as is) -->
    <link rel="icon" type="image/x-icon" href="../../assets/favicon/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="../../assets/favicon/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/favicon/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/favicon/apple-touch-icon.png">
    <link rel="manifest" href="../../assets/favicon/site.webmanifest">
    
    <!-- Your custom styles -->
    <style>
        /* Project-specific styles */
    </style>
</head>
<body>
    <!-- Back button (Keep this) -->
    <div style="text-align: center; margin-bottom: 2rem;">
        <a href="../../index.html" style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-size: 1rem; font-weight: 500;">
            <span style="margin-right: 0.5rem;">&#8592;</span> Back to Home
        </a>
    </div>
    
    <h1 style="text-align: center; font-size: 2.5rem; margin-bottom: 1rem;">Your Project Title</h1>
    
    <!-- Project description -->
    <div style="background-color: #edf2f7; padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 2rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto;">
        <p style="font-size: 1.125rem; line-height: 1.6;">
            Detailed project description goes here.
        </p>
        
        <div style="margin-top: 1.5rem;">
            <a href="https://github.com/yourusername/your-repo" 
               style="display: inline-block; padding: 0.75rem 1.5rem; background-color: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-size: 1rem; font-weight: 500;">
               View Project on GitHub
            </a>
        </div>
    </div>
    
    <!-- Project content goes here -->
    <div style="max-width: 800px; margin: 0 auto; padding: 1rem;">
        <!-- Your main project content, demo, images, etc. -->
    </div>
    
    <!-- Footer -->
    <footer style="margin-top: 3rem; text-align: center; color: #6b7280; font-size: 0.875rem;">
        <p>© 2025 <a href="../../index.html" style="color: #3182ce; text-decoration: none;">Your Name</a>. All rights reserved.</p>
    </footer>
</body>
</html>
```

## Examples to Reference

Study the existing project examples to understand different implementation approaches:

- [Password Generator](http://yliu.tech/projects/password-generator/index.html): Simple interactive JavaScript tool with local storage
- [Pollen Alert Germany](http://yliu.tech/projects/pollen-alert-germany/index.html): Data visualization with multilingual support (English, German, Chinese)
- [QPSK Modulation](http://yliu.tech/projects/qpsk-modulation/index.html): Interactive React-based visualization with dynamic components

Each example demonstrates different techniques while maintaining consistent navigation and styling. Use these as reference points for creating your own project pages.
