const API_KEY = 'PXjG2k4gTiQT1uLnemaLCDAX3RDa7jRbL69WIROx';

const prepareDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return [year, month, day].join('-');
};

export const getNeos = (day) => {
  const today = new Date();
  const startDate = prepareDate(
    new Date(today.getFullYear(), today.getMonth(), day)
  );
  const endDate = prepareDate(
    new Date(today.getFullYear(), today.getMonth(), day)
  );
  
  const URL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;

  return fetch(URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      return response.json();
    })
    .then((data) => {
      const neosData = Object.values(data.near_earth_objects);

      const maxDiameter = Math.max(
        ...neosData.flatMap((neo) =>
          neo.map((item) => item.estimated_diameter.kilometers.estimated_diameter_max)
        )
      );

      const hazardousCount = neosData
        .flat()
        .filter((neo) => neo.is_potentially_hazardous_asteroid).length;

      const closestNeo = Math.min(
        ...neosData
          .flat()
          .map((neo) => neo.close_approach_data[0].miss_distance.kilometers)
      );

      const fastestNeo = Math.max(
        ...neosData
          .flat()
          .map((neo) => neo.close_approach_data[0].relative_velocity.kilometers_per_hour)
      );

      return {
        date: startDate,
        maxDiameter,
        hazardousCount,
        closestNeo,
        fastestNeo,
      };
    })
    .catch((error) => {
      console.error(error);
      throw new Error();
    });
};
