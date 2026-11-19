import autoprefixer from "autoprefixer";

// iOS Safari için -webkit- öneklerini (backdrop-filter, mask-image vb.) otomatik ekler.
export default {
  plugins: [autoprefixer()],
};
