const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// Configuration
const CONFIG = {
  srcDir: 'src',
  outDir: 'docs',
  contentDir: 'src/content',
  templatesDir: 'src/templates',
  dataDir: 'src/data',
  assetsDir: 'src/assets'
};

// Custom marked renderer for expandable code blocks
const renderer = new marked.Renderer();

// Override code block rendering to support collapsible sections
renderer.code = function(code, language) {
  const escapedCode = escapeHtml(code);
  return `<pre><code class="language-${language || 'plaintext'}">${escapedCode}</code></pre>`;
};

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
  pedantic: false
});

// Process custom syntax for collapsible code blocks
function processCollapsibleCode(content) {
  // Match :::code{title="..." collapsed} ... ::: blocks
  const codeBlockRegex = /:::code\{title="([^"]+)"(?:\s+collapsed)?\}\s*\n([\s\S]*?):::/g;
  
  return content.replace(codeBlockRegex, (match, title, codeContent) => {
    const processedCode = marked.parse(codeContent.trim());
    return `<details class="code-collapse">
<summary><span class="code-title">${title}</span><span class="toggle-icon">▼</span></summary>
<div class="code-content">
${processedCode}
</div>
</details>`;
  });
}

// Process custom syntax for iframes
function processIframes(content) {
  // Match :::iframe{src="..." height="..."} blocks
  const iframeRegex = /:::iframe\{src="([^"]+)"(?:\s+height="(\d+)")?\}/g;
  
  return content.replace(iframeRegex, (match, src, height) => {
    const h = height || '500';
    return `<div class="iframe-container">
<iframe src="${src}" height="${h}" width="100%" frameborder="0" loading="lazy"></iframe>
</div>`;
  });
}

// Read and parse markdown file with frontmatter
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: markdown } = matter(content);
  
  // Process custom syntax
  let processedMarkdown = processCollapsibleCode(markdown);
  processedMarkdown = processIframes(processedMarkdown);
  
  // Convert to HTML
  const html = marked.parse(processedMarkdown);
  
  return { frontmatter, html };
}

// Read template file
function readTemplate(templateName) {
  const templatePath = path.join(CONFIG.templatesDir, templateName);
  return fs.readFileSync(templatePath, 'utf-8');
}

// Simple template engine
function renderTemplate(template, data) {
  let result = template;
  
  // Replace {{ variable }} patterns
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
}

// Read JSON data files
function readJsonData(filename) {
  const filePath = path.join(CONFIG.dataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// Generate project cards HTML
function generateProjectCards(projects, filterByLabel = null) {
  return projects
    .filter(p => !filterByLabel || p.labels.includes(filterByLabel))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(project => {
      const labelsHtml = project.labels
        .map(label => `<span class="label" data-label="${label}">${label}</span>`)
        .join('');
      
      const dateFormatted = formatDate(project.date);
      const year = new Date(project.date).getFullYear();
      
      let href = `projects/${project.id}.html`;
      if (project.customPage) {
        href = project.customPage;
      } else if (project.isBlogLink) {
        href = 'blog/index.html';
      }
      
      const featuredClass = project.featured ? 'featured' : '';
      
      return `
<article class="project-card ${featuredClass}" data-year="${year}" data-labels="${project.labels.join(',')}">
  <a href="${href}" class="project-link">
    <div class="project-image">
      <img src="assets/images/${project.image}" alt="${project.title}" loading="lazy" onerror="this.src='assets/images/placeholder.jpg'">
    </div>
    <div class="project-content">
      <time datetime="${project.date}">${dateFormatted}</time>
      <h3>${project.title}</h3>
      <p>${project.description}</p>
      <div class="project-labels">${labelsHtml}</div>
    </div>
  </a>
</article>`;
    })
    .join('\n');
}

// Generate unique labels from all projects
function getUniqueLabels(projects) {
  const labels = new Set();
  projects.forEach(p => p.labels.forEach(l => labels.add(l)));
  return Array.from(labels).sort();
}

// Generate label filter buttons
function generateLabelFilters(projects) {
  const labels = getUniqueLabels(projects);
  const buttons = labels.map(label => 
    `<button class="label-filter" data-filter="${label}">${label}</button>`
  ).join('\n');
  
  return `<button class="label-filter active" data-filter="all">All Projects</button>\n${buttons}`;
}

// Format date
function formatDate(dateStr) {
  if (dateStr === 'Ongoing') return 'Ongoing';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

// Generate sidebar eras JSON for JavaScript
function generateSidebarErasScript(eras) {
  return `<script>
const SIDEBAR_ERAS = ${JSON.stringify(eras, null, 2)};
</script>`;
}

// Build the home page
function buildHomePage() {
  const projects = readJsonData('projects.json');
  const sidebarEras = readJsonData('sidebar-eras.json');
  const template = readTemplate('base.html');
  
  const projectCards = generateProjectCards(projects);
  const labelFilters = generateLabelFilters(projects);
  const sidebarScript = generateSidebarErasScript(sidebarEras);
  
  const html = renderTemplate(template, {
    title: 'Corwin Dark - Data Science Portfolio',
    pageClass: 'home-page',
    navHome: 'active',
    navResume: '',
    navBlog: '',
    content: `
<section class="intro">
  <h1>Data Science for Financial Markets</h1>
  <p class="intro-text">I'm Corwin Dark, a data scientist focused on applying machine learning and statistical methods to financial markets. Browse my projects below to see my work in action.</p>
</section>

<section class="label-filters">
  <div class="filter-container">
    ${labelFilters}
  </div>
</section>

<section class="projects-feed">
  ${projectCards}
</section>
`,
    sidebarErasScript: sidebarScript
  });
  
  ensureDir(CONFIG.outDir);
  fs.writeFileSync(path.join(CONFIG.outDir, 'index.html'), html);
  console.log('Built: index.html');
}

// Build individual project pages
function buildProjectPages() {
  const projects = readJsonData('projects.json');
  const template = readTemplate('project.html');
  const projectsDir = path.join(CONFIG.contentDir, 'projects');
  
  ensureDir(path.join(CONFIG.outDir, 'projects'));
  
  projects.forEach(project => {
    // Skip projects with custom pages or blog links
    if (project.customPage || project.isBlogLink) return;
    
    const mdPath = path.join(projectsDir, `${project.id}.md`);
    
    let contentHtml;
    if (fs.existsSync(mdPath)) {
      const { frontmatter, html } = parseMarkdownFile(mdPath);
      contentHtml = html;
    } else {
      // Generate placeholder content
      contentHtml = `
<h1>${project.title}</h1>
<p class="project-meta">
  <time>${formatDate(project.date)}</time>
</p>
<p>${project.description}</p>
<p><em>Full writeup coming soon...</em></p>
`;
    }
    
    const labelsHtml = project.labels
      .map(l => `<span class="label">${l}</span>`)
      .join('');
    
    const html = renderTemplate(template, {
      title: `${project.title} - Corwin Dark`,
      pageClass: 'project-page',
      navHome: '',
      navResume: '',
      navBlog: '',
      projectTitle: project.title,
      projectDate: formatDate(project.date),
      projectLabels: labelsHtml,
      content: contentHtml
    });
    
    fs.writeFileSync(path.join(CONFIG.outDir, 'projects', `${project.id}.html`), html);
    console.log(`Built: projects/${project.id}.html`);
  });
}

// Build resume page
function buildResumePage() {
  const template = readTemplate('base.html');
  
  const html = renderTemplate(template, {
    title: 'Resume - Corwin Dark',
    pageClass: 'resume-page',
    navHome: '',
    navResume: 'active',
    navBlog: '',
    content: `
<section class="resume-section">
  <h1>Resume</h1>
  <div class="resume-actions">
    <a href="assets/resume.pdf" download class="btn btn-primary">Download PDF</a>
  </div>
  <div class="resume-embed">
    <iframe src="assets/resume.pdf" width="100%" height="800" type="application/pdf">
      <p>Your browser doesn't support embedded PDFs. 
        <a href="assets/resume.pdf">Download the resume</a> instead.
      </p>
    </iframe>
  </div>
</section>
`,
    sidebarErasScript: ''
  });
  
  fs.writeFileSync(path.join(CONFIG.outDir, 'resume.html'), html);
  console.log('Built: resume.html');
}

// Build blog index and posts
function buildBlogPages() {
  const template = readTemplate('base.html');
  const blogPostTemplate = readTemplate('blog-post.html');
  const blogDir = path.join(CONFIG.contentDir, 'blog');
  const outBlogDir = path.join(CONFIG.outDir, 'blog');
  
  ensureDir(outBlogDir);
  
  // Read all blog posts
  const posts = [];
  if (fs.existsSync(blogDir)) {
    const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
    
    files.forEach(file => {
      const filePath = path.join(blogDir, file);
      const { frontmatter, html } = parseMarkdownFile(filePath);
      const slug = path.basename(file, '.md');
      
      posts.push({
        slug,
        ...frontmatter,
        html
      });
      
      // Build individual blog post page
      const postHtml = renderTemplate(blogPostTemplate, {
        title: `${frontmatter.title} - Corwin Dark`,
        pageClass: 'blog-post-page',
        navHome: '',
        navResume: '',
        navBlog: 'active',
        postTitle: frontmatter.title,
        postDate: formatDate(frontmatter.date),
        postSeries: frontmatter.series || '',
        postPart: frontmatter.part || '',
        content: html
      });
      
      fs.writeFileSync(path.join(outBlogDir, `${slug}.html`), postHtml);
      console.log(`Built: blog/${slug}.html`);
    });
  }
  
  // Sort posts by date (newest first) and part number
  posts.sort((a, b) => {
    if (a.series === b.series && a.part && b.part) {
      return a.part - b.part;
    }
    return new Date(b.date) - new Date(a.date);
  });
  
  // Generate blog index
  const postsHtml = posts.map(post => `
<article class="blog-card">
  <a href="${post.slug}.html">
    <time datetime="${post.date}">${formatDate(post.date)}</time>
    ${post.series ? `<span class="series-badge">${post.series} - Part ${post.part}</span>` : ''}
    <h3>${post.title}</h3>
    <p>${post.description}</p>
  </a>
</article>
`).join('\n');
  
  const blogIndexHtml = renderTemplate(template, {
    title: 'Blog: Building a Foundation LLM - Corwin Dark',
    pageClass: 'blog-index-page',
    navHome: '',
    navResume: '',
    navBlog: 'active',
    content: `
<section class="blog-header">
  <h1>Building a Foundation LLM</h1>
  <p class="blog-intro">A blog series documenting my journey building a foundation language model from scratch. Follow along as I explore tokenization, attention mechanisms, training dynamics, and more.</p>
</section>

<section class="blog-posts">
  ${postsHtml || '<p>Coming soon...</p>'}
</section>
`,
    sidebarErasScript: ''
  });
  
  fs.writeFileSync(path.join(outBlogDir, 'index.html'), blogIndexHtml);
  console.log('Built: blog/index.html');
}

// Copy static assets
function copyAssets() {
  const assetsOutDir = path.join(CONFIG.outDir, 'assets');
  ensureDir(assetsOutDir);
  ensureDir(path.join(assetsOutDir, 'images'));
  ensureDir(path.join(assetsOutDir, 'gifs'));
  
  // Copy images from src/assets
  copyDirRecursive(path.join(CONFIG.assetsDir, 'images'), path.join(assetsOutDir, 'images'));
  copyDirRecursive(path.join(CONFIG.assetsDir, 'gifs'), path.join(assetsOutDir, 'gifs'));
  
  // Copy existing images from images/ folder
  if (fs.existsSync('images')) {
    copyDirRecursive('images', path.join(assetsOutDir, 'images'));
  }
  
  // Copy resume if exists
  const resumePath = path.join(CONFIG.dataDir, 'resume.pdf');
  if (fs.existsSync(resumePath)) {
    fs.copyFileSync(resumePath, path.join(assetsOutDir, 'resume.pdf'));
    console.log('Copied: resume.pdf');
  }
  
  // Copy favicon
  if (fs.existsSync('images/favicon-32x32.png')) {
    fs.copyFileSync('images/favicon-32x32.png', path.join(CONFIG.outDir, 'favicon.png'));
  }
  
  console.log('Copied: static assets');
}

// Copy arch_projects folder (existing D3 visualization)
function copyArchProjects() {
  if (fs.existsSync('arch_projects')) {
    const outDir = path.join(CONFIG.outDir, 'arch_projects');
    ensureDir(outDir);
    copyDirRecursive('arch_projects', outDir);
    console.log('Copied: arch_projects/');
  }
}

// Utility: ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Utility: copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Write CNAME file for GitHub Pages
function writeCNAME() {
  if (fs.existsSync('CNAME')) {
    fs.copyFileSync('CNAME', path.join(CONFIG.outDir, 'CNAME'));
    console.log('Copied: CNAME');
  }
}

// Create placeholder image
function createPlaceholderImage() {
  const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect fill="#1a1a2e" width="400" height="300"/>
  <text fill="#6c757d" font-family="sans-serif" font-size="24" text-anchor="middle" x="200" y="150">Image Coming Soon</text>
</svg>`;
  
  const placeholderPath = path.join(CONFIG.outDir, 'assets', 'images', 'placeholder.jpg');
  ensureDir(path.dirname(placeholderPath));
  
  // Write as SVG with .jpg extension (browsers handle this)
  fs.writeFileSync(placeholderPath.replace('.jpg', '.svg'), placeholder);
  fs.writeFileSync(placeholderPath, placeholder);
}

// Main build function
function build() {
  console.log('Building portfolio site...\n');
  
  // Clean output directory (preserve some files)
  // Note: We're not cleaning to preserve existing content during migration
  
  // Build pages
  buildHomePage();
  buildProjectPages();
  buildResumePage();
  buildBlogPages();
  
  // Copy assets
  copyAssets();
  copyArchProjects();
  createPlaceholderImage();
  writeCNAME();
  
  console.log('\n✓ Build complete!');
}

// Watch mode
function watch() {
  const chokidar = require('chokidar');
  
  console.log('Watching for changes...\n');
  build();
  
  const watcher = chokidar.watch([CONFIG.srcDir], {
    ignored: /node_modules/,
    persistent: true
  });
  
  watcher.on('change', (filePath) => {
    console.log(`\nFile changed: ${filePath}`);
    build();
  });
}

// CLI
const args = process.argv.slice(2);
if (args.includes('--watch')) {
  watch();
} else {
  build();
}

