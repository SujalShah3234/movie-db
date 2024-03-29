import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import {
  API,
  API_URL,
  IN_THEATERS,
  POPULAR_ON_TV,
  TRENDING_DAY,
  TRENDING_WEEK,
} from '../../Constants';
import MovieCard from '../MovieCard/MovieCard';
import { SkeletonLoader } from '../MovieCard/SkeletonLoader';
import CustomTab from '../Tabs/Tabs';
import Title from '../Title/Title';
import styles from './MoviesContainer.module.scss';

const MoviesContainer = ({
  category,
  mediaType,
  tabs,
  time,
  title,
  isBackground,
}) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState((tabs && tabs[0]) || '');
  const [url, setURL] = useState(
    `${API_URL}/${category}/${mediaType}/${time}?api_key=${API}`
  );

  const handleChange = (event, tabValue) => {
    setTabValue(tabValue);
  };

  useEffect(() => {
    switch (tabValue) {
      case 'Today':
        setURL(TRENDING_DAY);
        break;
      case 'This Week':
        setURL(TRENDING_WEEK);
        break;
      case 'On TV':
        setURL(POPULAR_ON_TV);
        break;
      case 'In Theaters':
        setURL(IN_THEATERS);
        break;
      default:
        break;
    }
  }, [tabValue]);

  const fetchMovies = useCallback(async () => {
    try {
      const res = await axios.get(url);
      const data = await res.data;
      setMovies(data.results);
      console.log('✅ Movies fetching done');
    } catch (error) {
      console.log('💀 Movies fetching failed', error.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleScroll = (e) => {
    const element = e.target;
    if (element.scrollLeft > 50) {
      element.style.setProperty('--opacity', 0);
    } else {
      element.style.setProperty('--opacity', 1);
    }
  };

  return (
    <section className={styles.scroll__wrap}>
      <div className={styles.column_wrapper}>
        <div className={styles.content_wrapper}>
          <div className={styles.column}>
            <div className={styles['movie-header-container']}>
              <Title>{title}</Title>
              {tabs && (
                <CustomTab
                  tabs={tabs}
                  handleChange={handleChange}
                  value={tabValue}
                />
              )}
            </div>
            <div className={styles.media}>
              <div
                onScroll={handleScroll}
                className={`${styles.inner__column} ${
                  isBackground ? styles['bg-image'] : ''
                }`}
              >
                {loading &&
                  [...Array(10)].map((_, i) => <SkeletonLoader key={i} />)}
                {!loading && movies ? (
                  movies.map((movie) => (
                    <MovieCard data={movie} key={movie.id} loading={loading} />
                  ))
                ) : (
                  <h1>Failed to fetch movies!</h1>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

MoviesContainer.propTypes = {
  category: PropTypes.string,
  mediaType: PropTypes.string,
  tabs: PropTypes.arrayOf(PropTypes.string),
  time: PropTypes.string,
  title: PropTypes.string,
  isBackground: PropTypes.bool,
};

MoviesContainer.defaultProps = {
  category: '',
  mediaType: '',
  tabs: [''],
  time: '',
  title: '',
  isBackground: false,
};

export default MoviesContainer;
