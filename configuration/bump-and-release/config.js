module.exports = {
  release: {
    prerelease: [
      {
        name: "generate changelog",
        command: "npm run changelog",
      },
    ],
  },
};
