/**
 * Storage Service - handles localStorage persistence, JSON import/export, and Markdown export
 */
import { INITIAL_CASE_STUDIES } from '../data/initialData.js';

const STORAGE_KEY = 'edexcel_geography_case_studies_v1';

export class StorageService {
  static getCaseStudies() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.saveCaseStudies(INITIAL_CASE_STUDIES);
        return [...INITIAL_CASE_STUDIES];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveCaseStudies(INITIAL_CASE_STUDIES);
        return [...INITIAL_CASE_STUDIES];
      }
      return parsed;
    } catch (e) {
      console.error('Error reading case studies from localStorage:', e);
      return [...INITIAL_CASE_STUDIES];
    }
  }

  static saveCaseStudies(studies) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studies));
      return true;
    } catch (e) {
      console.error('Error saving case studies to localStorage:', e);
      return false;
    }
  }

  static resetToDefault() {
    this.saveCaseStudies(INITIAL_CASE_STUDIES);
    return [...INITIAL_CASE_STUDIES];
  }

  static exportJSON(studies) {
    const dataStr = JSON.stringify(studies, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Edexcel_A-Level_Geography_Case_Studies_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported JSON file must contain an array of case studies.');
      }
      
      // Basic schema verification
      for (const item of parsed) {
        if (!item.title || !item.category || !item.topic || typeof item.lat !== 'number' || typeof item.lng !== 'number') {
          throw new Error(`Invalid case study entry format for: ${item.title || 'Untitled'}`);
        }
        if (!Array.isArray(item.stats) || !item.evaluation || !Array.isArray(item.evaluation.strengths) || !Array.isArray(item.evaluation.limitations)) {
          throw new Error(`Missing stats or AO2 evaluation points format for: ${item.title}`);
        }
      }

      this.saveCaseStudies(parsed);
      return { success: true, count: parsed.length, data: parsed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  static exportMarkdown(studies) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    let md = `# Pearson Edexcel A-Level Geography Case Studies & Revision Guide\n`;
    md += `*Exported on ${dateStr} • Specification 9GE0: Dynamic Landscapes, Dynamic Places, Global Challenges*\n\n`;
    md += `---\n\n`;
    md += `## Table of Contents\n\n`;

    // Group by category and topic
    const physical = studies.filter(s => s.category === 'Physical');
    const human = studies.filter(s => s.category === 'Human');

    md += `### 🌍 Physical Geography (${physical.length})\n`;
    physical.forEach((s, idx) => {
      md += `${idx + 1}. [${s.title} (${s.topic})](#${this.slugify(s.title)})\n`;
    });

    md += `\n### 🏙️ Human Geography (${human.length})\n`;
    human.forEach((s, idx) => {
      md += `${idx + 1}. [${s.title} (${s.topic})](#${this.slugify(s.title)})\n`;
    });

    md += `\n---\n\n`;

    // Generate markdown for each case study
    studies.forEach((s) => {
      md += `## ${s.title}\n\n`;
      md += `**Category:** ${s.category} Geography  \n`;
      md += `**Edexcel Specification Topic:** \`${s.topic}\`  \n`;
      md += `**Location:** ${s.country} *(Coordinates: ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)})*  \n\n`;

      if (s.synopticLinks && s.synopticLinks.length > 0) {
        md += `### 🔗 Synoptic Links (Paper 3 / Cross-Topic Themes)\n`;
        s.synopticLinks.forEach(link => {
          md += `- ${link}\n`;
        });
        md += `\n`;
      }

      md += `### 📝 Executive Overview\n${s.summary}\n\n`;

      md += `### 📊 Place-Specific Facts & Statistics (AO1 Knowledge)\n`;
      s.stats.forEach(stat => {
        md += `- **•** ${stat}\n`;
      });
      md += `\n`;

      if (s.causes) {
        md += `### ⚡ Causes & Processes\n${s.causes}\n\n`;
      }

      if (s.impacts) {
        md += `### 💥 Impacts & Consequences\n`;
        if (typeof s.impacts === 'object') {
          if (s.impacts.social) md += `- **Social:** ${s.impacts.social}\n`;
          if (s.impacts.economic) md += `- **Economic:** ${s.impacts.economic}\n`;
          if (s.impacts.environmental) md += `- **Environmental:** ${s.impacts.environmental}\n`;
        } else {
          md += `${s.impacts}\n`;
        }
        md += `\n`;
      }

      if (s.management) {
        md += `### 🛡️ Management, Mitigation & Governance\n${s.management}\n\n`;
      }

      md += `### ⚖️ Evaluation & Synoptic Judgment (AO2 Points for 12/20-Mark Essays)\n\n`;
      md += `| Successes & Strengths (Arguments For) | Limitations & Failures (Counter-Arguments) |\n`;
      md += `| :--- | :--- |\n`;

      const maxLen = Math.max(s.evaluation.strengths.length, s.evaluation.limitations.length);
      for (let i = 0; i < maxLen; i++) {
        const str = s.evaluation.strengths[i] ? s.evaluation.strengths[i].replace(/\|/g, '\\|') : '';
        const lim = s.evaluation.limitations[i] ? s.evaluation.limitations[i].replace(/\|/g, '\\|') : '';
        md += `| ${str} | ${lim} |\n`;
      }
      md += `\n`;

      if (s.examTips) {
        md += `> **💡 Edexcel Examiner Advice / AO2 Tips:**  \n> ${s.examTips}\n\n`;
      }

      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateFilename = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `Edexcel_A-Level_Geography_Revision_Guide_${dateFilename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
}
