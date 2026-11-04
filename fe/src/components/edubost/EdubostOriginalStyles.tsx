const styles = [
  "bootstrap.min.css",
  "fontawesome.css",
  "animate.css",
  "swiper.min.css",
  "odometer.css",
  "magnific-popup.css",
  "recoleta-font.css",
  "nice-select.css",
  "main.css",
];

/** Loads the unmodified stylesheets shipped with the Edubost template. */
export function EdubostOriginalStyles() {
  return styles.map((file) => (
    <link
      key={file}
      rel="stylesheet"
      href={`/edubost-reference/css/${file}`}
      precedence="edubost"
    />
  ));
}
