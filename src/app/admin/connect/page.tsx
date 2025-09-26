"use client";

import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Alert } from "@mui/material";
import { generateCodeVerifier, generateCodeChallenge } from "@/utils/pkce";

const clientId = "Ov23li8tNyy6uWkjb7yz";

const ConnectPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the URL contains the GitHub OAuth code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Retrieve the code verifier from sessionStorage
      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (codeVerifier) {
        // Exchange the code for an access token
        fetchAccessToken(code, codeVerifier);
      } else {
        setError("Code verifier is missing. Please try connecting again.");
      }
    }
  }, []);

  const fetchAccessToken = async (code: string, codeVerifier: string) => {
    try {
      // Exchange the authorization code for an access token
      const response = await fetch(
        `https://github.com/login/oauth/access_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            code,
            code_verifier: codeVerifier,
          }),
        }
      );

      const data = await response.json();

      if (data.access_token) {
        setToken(data.access_token);
        localStorage.setItem("github_token", data.access_token); // Store the token in localStorage
      } else {
        setError("Failed to retrieve access token.");
      }
    } catch (err) {
      console.error("Error fetching access token:", err);
      setError("An error occurred while connecting to GitHub." + err);
    }
  };

  const handleConnect = async () => {
    const redirectUri = window.location.origin + "/admin/connect"; // Redirect back to this page

    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store the code verifier in sessionStorage
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);

    // Redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = githubAuthUrl;
  };

  const handleDisconnect = () => {
    setToken(null);
    localStorage.removeItem("github_token");
  };

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Connect to GitHub
      </Typography>

      {token ? (
        <Alert severity="success" sx={{ marginBottom: "1rem" }}>
          Connected to GitHub!
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ marginBottom: "1rem" }}>
          Not connected to GitHub.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ marginBottom: "1rem" }}>
          {error}
        </Alert>
      )}

      <Box>
        {token ? (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleConnect}>
            Connect to GitHub
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ConnectPage;
