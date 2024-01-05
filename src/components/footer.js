import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import {
  faFacebook,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

import Background from "./background.js";

const Footer = ({ siteMetaData, frontmatter,footerExtraStyles, ...otherProps}) => {
  
  const { className } = otherProps;
  const classValue = `footer ${className ? className : ""}`;  

  return (
    <footer className={`${classValue}${footerExtraStyles ? footerExtraStyles : ''}`}>
      <Background
        {...(frontmatter?.footerImage ? { src: frontmatter?.footerImage  } : {})}
        className="footer__background"
      >
        <div className="footer__logo">
          <h3 className="footer__logo__text">{siteMetaData.title}</h3>
          <div className="footer__logo__image"></div>
          <div className="footer__logo__image2"></div>
        </div>
        <div className="footer__version text--hand-written">
          v{siteMetaData.version}
        </div>
        <div className="footer__icons">
          <ul className="footer__icons__wrapper">
            {siteMetaData.authorEmail !== undefined &&
            siteMetaData.authorEmail.length ? (
              <li>
                <a
                  href={"mailto: " + siteMetaData.authorEmail}
                  data-email={siteMetaData.authorEmail}
                  target="_blank"
                >
                  <FontAwesomeIcon icon={faEnvelope} fixedWidth size="1x"/>
                </a>
              </li>
            ) : (
              ""
            )}

            {siteMetaData.facebookUrl !== undefined &&
            siteMetaData.facebookUrl.length ? (
              <li>
                <a href={siteMetaData.facebookUrl} target="_blank">
                  <FontAwesomeIcon icon={faFacebook} fixedWidth size="1x"/>
                </a>
              </li>
            ) : (
              ""
            )}

            {siteMetaData.instagramUrl !== undefined &&
            siteMetaData.instagramUrl.length ? (
              <li>
                <a href={siteMetaData.instagramUrl} target="_blank">
                  <FontAwesomeIcon icon={faInstagram} fixedWidth size="1x" />
                </a>
              </li>
            ) : (
              ""
            )}

            {siteMetaData.youtubeUrl !== undefined &&
            siteMetaData.youtubeUrl.length ? (
              <li>
                <a href={siteMetaData.youtubeUrl} target="_blank">
                  <FontAwesomeIcon icon={faYoutube} fixedWidth size="1x" />
                </a>
              </li>
            ) : (
              ""
            )}
          </ul>
        </div>
      </Background>
    </footer>
  );
};
export default Footer;
