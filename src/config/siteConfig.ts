import { SiteMetaData } from "@/types";

const siteMetaData: SiteMetaData = {
  version: "", // "2.0.0",
  title: "artiYoga",
  description: "siteDescription",
  url: "https://www.artiyoga.com",
  youtubeUrl: "https://www.youtube.com/channel/UCl_6cWf7A0yPr2GPW4uJ7lw",
  facebookUrl: "https://www.facebook.com/baroni.kati",
  instagramUrl: "https://www.instagram.com/baroni.kati/",
  authorEmail: "baroni.kati@gmail.com",
  extraBackgroundText: "Love & Peace",
  defaultImage: "/images/lessons/priveyoga.jpg", // Path to your default image
  menuLinks: [
    {
      name: "Yoga & Qigong",
      link: "",
      subMenu: [
        { name: "Groepslessen", link: "/lessons/groups" },
        { name: "VrouwenYoga Cirkel", link: "/lessons/women" },
        { name: "Privé Lessen", link: "/lessons/personal" },
        { name: "Online Lessen", link: "/lessons/video" },
      ],
    },
    {
      name: `Reiki`,
      link: `/reiki`,
      subMenu: [
        { name: "Introductie", link: "/reiki/intro" },
        { name: "Reiki-cursus 1", link: "/reiki/level1" },
        { name: "Reiki-cursus 2", link: "/reiki/level2" },
        { name: "Reiki-cursus 3", link: "/reiki/level3" },
        { name: "Reiki workshops", link: "/reiki/workshops" },
        { name: "Reiki 1 op 1", link: "/reiki/1to1" },
      ],
    },
    {
      name: `Coaching`,
      link: `/coaching`,
    },
    {
      name: `Events`,
      link: `/events`,
    },
    {
      name: `About`,
      link: ``,
      subMenu: [
        {
          name: `Kati`,
          link: `/about/kati`,
        },
        {
          name: `Yogastijlen`,
          link: `/about/yogastyles`,
        },
      ],
    },

    {
      name: `Contact`,
      link: `/contact`,
    },
  ],
};

export default siteMetaData;
