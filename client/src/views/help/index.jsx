// src/views/help/index.jsx
import React, { useRef } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { Box, Divider } from '@mui/material';

import HeaderHero from './modules/HeaderHero';
// import SupportGrid from './modules/SupportGrid';
import FAQ from './modules/FAQ';
import ContactPanel from './modules/ContactPanel';

export default function HelpPage() {
  const contactRef = useRef(null);

  const scrollToContact = () => {
    const el = contactRef.current?.getElement?.();
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const prefillAndScroll = (topic) => {
    contactRef.current?.setTopic?.(topic);
    scrollToContact();
  };

  return (
    <MainCard content={false} sx={{ overflow: 'hidden' }}>
      <HeaderHero onContactClick={() => scrollToContact()} onDocsClick={() => prefillAndScroll('Documentation')} />

      {/* Contact FIRST (as requested) */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 }, pt: 0 }}>
        <ContactPanel ref={contactRef} />
      </Box>

      <Divider />

      {/* <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 } }}>
        <SupportGrid onRoute={(topic) => prefillAndScroll(topic)} />
      </Box> */}

      <Divider />

      <Box sx={{ maxWidth: 1280, mx: 'auto', p: { xs: 2.5, md: 4 } }}>
        <FAQ />
      </Box>
    </MainCard>
  );
}
