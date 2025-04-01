const projectsData = [
  {
    id: 'qpsk-modulation',
    title: "QPSK Modulation Visualization",
    description: "An interactive digital communication demonstration tool that visualizes QPSK modulation techniques with adjustable noise levels and signal plotting.",
    preview_image: "projects/qpsk-modulation/preview.jpg",
    tags: ["C", "HTML/CSS", "JavaScript"],
    live_demo: "projects/qpsk-modulation",
    github_url: "https://github.com/jumpjumptiger007/DigitalComm-QPSK-UDP",
  },
  {
    id: 'password-generator',
    title: "Password Generator",
    description: "A secure password generator with customizable options for length, character types, and exclusion rules. Includes strength meter and password history.",
    preview_image: "projects/password-generator/preview.jpg",
    tags: ["HTML/CSS", "JavaScript"],
    live_demo: "projects/password-generator",
    github_url: "https://github.com/jumpjumptiger007/password-generator",
  },
  {
    id: 'pollen-alert-germany',
    title: "Pollen Alert Germany",
    description: "A multilingual pollen concentration alert system for Germany, providing real-time pollen forecasts in English, German, and Chinese with email notifications.",
    preview_image: "projects/pollen-alert-germany/preview.jpg",
    tags: ["Python", "HTML/CSS", "Web Scraping"],
    live_demo: "projects/pollen-alert-germany",
    github_url: "https://github.com/jumpjumptiger007/pollen-alert-germany",
  },
  {
    id: 'portfolio-website', 
    title: "Personal Portfolio Website", 
    description: "A responsive, multilingual personal portfolio website showcasing projects, skills, and contact information. Built with modern web technologies and featuring dynamic language support.",  
    preview_image: "projects/portfolio-website/preview.jpg",  
    tags: ["HTML/CSS", "JavaScript"],  
    live_demo: "https://yliu.tech",  
    github_url: "https://github.com/jumpjumptiger007/portfolio-website",  
  }
];

const projectGrid = document.querySelector('.project-grid');

// Load project data
function loadProjects() {
  console.log('Starting to load projects...');
  
  if (projectGrid) {
    projectGrid.innerHTML = '';
    console.log('Project grid cleared');
  } else {
    console.warn('Project grid element not found!');
    return;
  }

  projectsData.forEach((project, index) => {
    console.log(`Loading project: ${project.title}`);
    addProjectToGrid(project, index);
  });
  
  console.log('Projects loading completed.');
}

// Add project to grid
function addProjectToGrid(project, index) {
  if (!projectGrid) {
    console.error('Cannot add project to grid: project grid element not found');
    return;
  }

  console.log(`Adding project to grid: ${project.title}`);

  const projectCard = document.createElement('div');
  
  const delayClass = index > 0 ? ` delay-${index}` : '';
  
  projectCard.className = `project-card fadeIn${delayClass}`;

  // Default placeholder image
  const defaultImage = 'https://via.placeholder.com/800x450?text=' + encodeURIComponent(project.title);
  
  // Use actual project image if available
  const imageSrc = project.preview_image || defaultImage;
  
  projectCard.innerHTML = `
    <img 
      src="${imageSrc}" 
      alt="${project.title}" 
      class="project-image" 
      onerror="this.src='${defaultImage}'; this.onerror=null;"
    >
    <div class="project-content">
      <div class="project-tags">
        ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
      </div>
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      <div class="project-links">
        ${project.live_demo ? `
          <a href="${project.live_demo}" class="project-link">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>
        ` : ''}
        ${project.github_url ? `
          <a href="${project.github_url}" class="project-link" target="_blank">
            <i class="fab fa-github"></i> GitHub
          </a>
        ` : ''}
      </div>
    </div>
  `;

  projectGrid.appendChild(projectCard);
}

document.addEventListener('DOMContentLoaded', loadProjects);

