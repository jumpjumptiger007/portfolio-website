# 🌟 Personal Portfolio Website Template

A clean, responsive static portfolio website template designed to be hosted on GitHub Pages. Showcase your projects, skills, and contact information with this easy-to-customize template.

[![View Live Demo](https://img.shields.io/badge/View_Live_Demo-Portfolio_Website-3182CE?style=for-the-badge&logo=github)](https://yliu.tech/)

## 🚀 Getting Started

This template is designed to be easily deployed to GitHub Pages. Here's how to set it up:

1. Fork this repository
2. Go to repository Settings > Pages
3. Set Source to your main branch
4. Your site will be published at `https://yourusername.github.io/repository-name/` (If you name your repository `yourusername.github.io`, it will be published at `https://yourusername.github.io` or you can configure your own custom domain in the settings)

## 🎨 Customization Guide

### 🧩 Basic Information

Edit the `index.html` file to update:

- Your name and tagline in the hero section
- Profile picture (replace `assets/profile.jpg`)
- About section content and skills
- Footer information

### 📂 Projects Section

The projects section is managed through the `js/projects.js` file. See the [Projects README](projects/README.md) for detailed instructions on adding and customizing projects.

### 📧 Contact Form

The contact form uses [Formspree](https://formspree.io/) as a backend:

1. Create a free account at Formspree
2. Create a new form and get your form endpoint
3. Replace the form action URL in `index.html`:

```html
<form id="contactForm" action="https://formspree.io/f/YOUR_ENDPOINT" method="POST">
```

### 🌐 Multilingual Support

The template supports English and German by default. To modify:

1. Edit the translations in `js/main.js`:

```javascript
const translations = {
    en: {
        // English translations
    },
    de: {
        // German translations
    },
    // Add your languages here
};
```

2. Add language selector buttons in `index.html`:

```html
<button class="language-btn" data-lang="your-language-code">
    <img src="assets/flags/your-language.svg" alt="Language Name">
</button>
```

3. Add your language flag SVG files to `assets/flags/` folder. You can find flag icons at [Flag Icons](https://flagicons.lipis.dev/).

### 🎭 Custom Styling

Modify the colors and styles in `css/styles.css`. The main color scheme is defined in the `:root` variables at the top of the file.

## 🤝 Contribution

If you encounter any issues or have suggestions for improvement, please open an issue or submit a pull request to help make this template better.

## 📄 License

This template is available under the MIT License.

## 🌐 Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design for mobile, tablet, and desktop
