// ============================================================================
// CAREERS.HTML - Replace the handleCareerSubmit function with this code
// ============================================================================
// 
// INSTRUCTIONS:
// 1. Open careers.html from https://github.com/Michael-Za/Html-elite
// 2. Find the existing handleCareerSubmit function
// 3. Replace it ENTIRELY with the code below
// 4. Commit and push the changes
//
// ============================================================================

async function handleCareerSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const formData = new FormData();

    // Text fields - adjust selectors to match your actual form field names
    const fields = {
      full_name:       document.querySelector('[name="careerName"]')?.value || document.querySelector('[name="fullName"]')?.value,
      age:             document.querySelector('[name="careerAge"]')?.value || document.querySelector('[name="age"]')?.value,
      city:            document.querySelector('[name="careerCity"]')?.value || document.querySelector('[name="city"]')?.value,
      email:           document.querySelector('[name="careerEmail"]')?.value || document.querySelector('[name="email"]')?.value,
      whatsapp:        document.querySelector('[name="careerWhatsApp"]')?.value || document.querySelector('[name="whatsapp"]')?.value,
      linkedin:        document.querySelector('[name="careerLinkedin"]')?.value || document.querySelector('[name="linkedin"]')?.value,
      education:       document.querySelector('[name="careerEducation"]')?.value || document.querySelector('[name="education"]')?.value,
      current_status:  document.querySelector('[name="careerStatus"]')?.value || document.querySelector('[name="currentStatus"]')?.value,
      field:           document.querySelector('[name="careerField"]')?.value === 'Other'
                         ? document.querySelector('[name="careerOtherField"]')?.value
                         : document.querySelector('[name="careerField"]')?.value || document.querySelector('[name="field"]')?.value,
      expertise_level: document.querySelector('[name="careerExpertise"]')?.value || document.querySelector('[name="expertiseLevel"]')?.value,
      work_experience: document.querySelector('[name="careerExperience"]')?.value || document.querySelector('[name="workExperience"]')?.value,
      english_level:   document.querySelector('[name="careerEnglish"]')?.value || document.querySelector('[name="englishLevel"]')?.value,
      other_skills:    [...document.querySelectorAll('[name="skill"]:checked')].map(c => c.value).join(', '),
      cover_message:   document.querySelector('[name="careerNotes"]')?.value || document.querySelector('[name="coverMessage"]')?.value,
    };
    
    // Append all non-empty fields
    Object.entries(fields).forEach(([k, v]) => { 
      if (v) formData.append(k, v); 
    });

    // Voice note — append binary directly to FormData
    const voiceInput = document.querySelector('[name="voiceNote"]') || document.querySelector('[name="voice_note"]');
    if (voiceInput?.files[0]) {
      const vf = voiceInput.files[0];
      if (vf.size > 16 * 1024 * 1024) throw new Error('Voice note must be under 16MB');
      formData.append('voice_note', vf);
    }

    // Video — upload to Hostinger first, then send URL
    const videoInput = document.querySelector('[name="videoIntro"]') || document.querySelector('[name="video_intro"]');
    if (videoInput?.files[0]) {
      const vf = videoInput.files[0];
      if (vf.size > 100 * 1024 * 1024) throw new Error('Video must be under 100MB');

      const vForm = new FormData();
      vForm.append('video', vf);
      
      const vRes = await fetch('https://elitepartnersus.com/upload-video.php', {
        method: 'POST',
        headers: { 'X-Upload-Secret': 'elite_upload_2026_xK9' },
        body: vForm
      });
      
      const vData = await vRes.json();
      if (!vData.url) throw new Error('Video upload failed. Please try again.');
      formData.append('video_url', vData.url);
    }

    // Submit everything to CRM
    const res = await fetch('https://crm.elitepartnersus.com/api/careers', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (res.status === 409) {
      // Duplicate email — friendly message
      throw new Error('You have already submitted an application with this email. We will be in touch!');
    }
    if (!res.ok) throw new Error(data.error || 'Submission failed');

    // Success — replace form with confirmation message (no alert)
    document.getElementById('careerForm').innerHTML = `
      <div style="text-align:center;padding:48px 24px;">
        <div style="font-size:3rem;margin-bottom:16px;">✅</div>
        <h3 style="font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#60a5fa;margin-bottom:12px;">
          Application Received!
        </h3>
        <p style="color:#a0a0a8;line-height:1.8;max-width:400px;margin:0 auto;">
          Our talent team will review your details and reach out via WhatsApp or Email as soon as possible.
        </p>
      </div>
    `;

  } catch (err) {
    // Show error inline below the button — no alert()
    let errEl = document.getElementById('formError');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'formError';
      errEl.style.cssText = 'color:#f87171;font-size:.85rem;margin-top:12px;text-align:center;';
      btn.parentNode.insertBefore(errEl, btn.nextSibling);
    }
    errEl.textContent = '⚠ ' + err.message;
    btn.disabled = false;
    btn.textContent = origText;
  }
}
