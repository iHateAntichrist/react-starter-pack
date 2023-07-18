/* eslint-disable react-hooks/exhaustive-deps */
import './NeosList.scss';
import classNames from "classnames";

import React, { useEffect, useState } from "react";
import { getNeos } from "../../services/neo";
import { Loader } from "../Loader";

export const NeosList = () => {
  const [neos, setNeos] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);

  const loadNeosFromServer = async () => {
    try {
      const neosData = await getNeos(currentDay); 
      const newNeo = {
        date: neosData.date,
        maxDiameter: neosData.maxDiameter,
        hazardousCount: neosData.hazardousCount,
        closestNeo: neosData.closestNeo,
        fastestNeo: neosData.fastestNeo,
      };

      setNeos((prevNeos) => {
        let updatedNeos = [...prevNeos];

        updatedNeos.push(newNeo);

        if (updatedNeos.length > 6) {
          updatedNeos.shift();
        }

        return updatedNeos;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const updateCurrentDay = (prevDay) => {
      if (prevDay >= new Date().getDate()) {
        return 1;
      } else {
        return prevDay + 1;
      }
    };
  
    const interval = setInterval(async () => {
      await loadNeosFromServer();
      setCurrentDay(updateCurrentDay);
    }, 5000);
  
    return () => {
      clearInterval(interval);
    };
  }, [currentDay]);

  const getHighestHazardousCounts = () => {
    const sortedNeos = [...neos].sort(
      (a, b) => b.hazardousCount - a.hazardousCount
    );
    return sortedNeos.slice(0, 2);
  };

  const highestHazardousCounts = getHighestHazardousCounts();

  return (
    <div>
      <h1>Near Orbital Objects (NEO)</h1>
  
      <ul>
        {neos.length === 0 ? (
          <Loader />
        ) : (
          neos.map(({ 
            date, 
            maxDiameter, 
            hazardousCount, 
            closestNeo, 
            fastestNeo 
          }) => (
            <li 
              key={Math.random()}
              className={classNames("card", {
                "card--red": highestHazardousCounts.some(
                  (neo) => neo.hazardousCount === hazardousCount
                ),
              })}
            >
              <h2 className="card__item">
                Date: {date}</h2>
              <p className="card__item">
                Max Estimated Diameter (km): {maxDiameter}</p>
              <p className="card__item">
                Potentially Hazardous NEOs: {hazardousCount}</p>
              <p className="card__item">
                Closest NEO (km): {closestNeo}</p>
              <p className="card__item">
                Fastest NEO (kph): {fastestNeo}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
