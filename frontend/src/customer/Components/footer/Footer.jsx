import { Box, Link, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

const FooterLink = memo(({ onClick, children }) => (
  <Typography
    variant="body2"
    component="p"
    gutterBottom
    sx={{
      cursor: "pointer",
      transition: "color 0.2s ease-in-out",
      color: "#ffffff",
      "&:hover": {
        color: "#e0e0e0",
      },
    }}
    onClick={onClick}
  >
    {children}
  </Typography>
));

const FooterSection = memo(({ title, links }) => (
  <Box
    sx={{
      flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" },
      mb: { xs: 4, sm: 0 },
      px: 2,
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#ffffff" }}>
      {title}
    </Typography>
    {links.map(({ label, onClick }) => (
      <FooterLink key={label} onClick={onClick}>
        {label}
      </FooterLink>
    ))}
  </Box>
));

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "About Omkar Wood",
      links: [
        { label: "Our Story", onClick: () => navigate("/about") },
        { label: "Showrooms", onClick: () => navigate("/showrooms") },
        { label: "Craftsmanship", onClick: () => navigate("/craftsmanship") },
        { label: "Design Services", onClick: () => navigate("/design-services") },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { label: "Help Center", onClick: () => navigate("/help") },
        { label: "Contact Us", onClick: () => navigate("/contact") },
        { label: "Delivery Information", onClick: () => navigate("/delivery") },
        { label: "Assembly Services", onClick: () => navigate("/assembly") },
      ],
    },
    {
      title: "Our Policies",
      links: [
        { label: "Privacy Policy", onClick: () => navigate("/privacy") },
        { label: "Terms of Service", onClick: () => navigate("/terms") },
        { label: "Warranty Information", onClick: () => navigate("/warranty") },
        { label: "Care Instructions", onClick: () => navigate("/care") },
      ],
    },
    {
      title: "Connect With Us",
      links: [
        { 
          label: "Facebook", 
          onClick: () => window.open("https://facebook.com/omkarwood", "_blank", "noopener,noreferrer") 
        },
        { 
          label: "Instagram", 
          onClick: () => window.open("https://instagram.com/omkarwood", "_blank", "noopener,noreferrer") 
        },
        { 
          label: "Pinterest", 
          onClick: () => window.open("https://pinterest.com/omkarwood", "_blank", "noopener,noreferrer") 
        },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#8B4513",
        color: "#ffffff",
        py: 6,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Box sx={{ flex: "1 1 100%", maxWidth: "300px", mb: { xs: 4, md: 0 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <img
              src="/Logo.png"
              alt="Omkar Wood"
              style={{ width: "40px", height: "40px", marginRight: "12px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              Omkar Wood
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#ffffff", mb: 2 }}>
            Crafting timeless furniture with passion and precision since 1990.
          </Typography>
        </Box>

        {footerSections.map((section) => (
          <FooterSection
            key={section.title}
            title={section.title}
            links={section.links}
          />
        ))}
      </Box>

      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          mt: 6,
          pt: 3,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          © {currentYear} Omkar Wood. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default memo(Footer);
