// @ts-nocheck
import React from "react";
import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr, Img } from "@react-email/components";

interface StudioInvitationProps {
  email: string;
  role: string;
  organizationName: string;
  token: string;
}

export const StudioInvitation = ({
  email,
  role,
  organizationName,
  token,
}: StudioInvitationProps) => {
  const loginUrl = `https://studio.techambiance.com/admin/login?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>You have been invited to join {organizationName} on StudioHQ</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            {/* Replace with actual logo URL */}
            <Img src="https://via.placeholder.com/150x50?text=StudioHQ" alt="StudioHQ Logo" width="150" height="50" style={logo} />
          </Section>
          <Section style={content}>
            <Text style={heading}>Join {organizationName}</Text>
            <Text style={paragraph}>
              Hello,
            </Text>
            <Text style={paragraph}>
              You have been invited to join <strong>{organizationName}</strong> as a <strong>{role}</strong> on StudioHQ.
            </Text>
            <Text style={paragraph}>
              StudioHQ is the central operating system for Tech Ambiance. Click the button below to accept your invitation and access your workspace.
            </Text>
            <Section style={btnContainer}>
              <Button style={button} href={loginUrl}>
                Accept Invitation
              </Button>
            </Section>
            <Text style={paragraph}>
              Or copy and paste this URL into your browser:
              <br />
              <a href={loginUrl} style={link}>{loginUrl}</a>
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              This invitation was sent to {email}. If you were not expecting this invitation, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const header = {
  padding: "24px",
  backgroundColor: "#0B3027", // Tech Ambiance brand color
  borderRadius: "8px 8px 0 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "24px",
  backgroundColor: "#ffffff",
  borderRadius: "0 0 8px 8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#18181b",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3f3f46",
};

const btnContainer = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#D3A971", // Tech Ambiance gold accent
  borderRadius: "6px",
  color: "#18181b",
  fontWeight: "600",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const link = {
  color: "#0B3027",
  textDecoration: "underline",
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "20px 0",
};

const footer = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "24px",
};
