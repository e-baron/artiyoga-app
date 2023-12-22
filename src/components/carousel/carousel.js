"use client";
import { Carousel as ReactCarousel } from "react-responsive-carousel";
import { allMDXPages } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer/hooks";
import Background from "../background.js";
import "react-responsive-carousel/lib/styles/carousel.min.css";

/**
 * 
 * @param {*} param0 
 * @returns 
 */

const Carousel = ({ children, backgroundImageName }) => {
  const testimonials = allMDXPages.filter(
    (mdxPage) => mdxPage._raw?.sourceFilePath.includes("testimonial")
  );

  if(!testimonials || testimonials.length === 0 ) return null;
  

  const carousel = (
    <ReactCarousel
      infiniteLoop={true}
      useKeyboardArrows={true}
      autoPlay={true}
      interval={5000}
      showStatus={false}
      showThumbs={false}
    >
      {testimonials?.map((testimonial, index) => (
        <div className="quote" key={index}>
          <div className="quote__content">
            <h3>
              <span>{testimonial.body.raw}</span>
            </h3>
            <h4>{testimonial.author}</h4>
          </div>
        </div>
      ))}
    </ReactCarousel>
  );

  if (backgroundImageName) {
    return (
      <div className="carousel__wrapper">
        <Background src={backgroundImageName} className="carousel__wrapper__background">{carousel}</Background>
      </div>
    );
  }
  return <div className="carousel__wrapper">{carousel}</div>;

};

export default Carousel;
