import axios from 'axios';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ColorExtractor } from 'react-color-extractor';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import {
  API,
  API_URL,
  BACKDROP_URL,
  POSTER_URL,
  STREAMING_URL,
} from '../../Constants';
import { dateToYear, slashDate } from '../../Helpers/ConvertDate';
import { genreNames } from '../../Helpers/Genres';
import { convertRuntime } from '../../Helpers/ConvertRuntime';
import { RatingProgress } from '../../Components/RatingProgress/RatingProgress';
import { TrailerModal } from '../../Components/TrailerModal/TrailerModal';
import { CastContainer } from '../../Components/CastContainer/CastContainer';
import useTitle from '../../Hooks/useTitle';
import imageErrorSrc from '../../assets/image-fallback.svg';

import styles from './ViewMore.module.scss';

const ViewMore = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [colors, setColors] = useState([]);
  const [movieData, setMovieData] = useState([]);
  const [trailerData, setTrailerData] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalProps, setModalProps] = useState({
    open: false,
    data: {},
    handleClose: () => {},
  });

  const fetchMovie = useCallback(async () => {
    const url = `${API_URL}/${params.type}/${params.id}?api_key=${API}`;
    const trailerUrl = `${API_URL}/${params.type}/${params.id}/videos?api_key=${API}`;
    const providerUrl = `${API_URL}/${params.type}/${params.id}/watch/providers?api_key=${API}`;

    try {
      const movie = await axios.get(url);
      setMovieData(movie.data);
      console.log('✅ Movie details fetched successfully');
    } catch (e) {
      if (e?.response?.status === 404) {
        navigate('/not-found', { replace: true });
      } else {
        console.log('💀 Failed to fetch movie details:', e);
      }
    } finally {
      setLoading(false);
    }

    try {
      const trailer = await axios.get(trailerUrl);
      setTrailerData(
        trailer.data.results.find((trailer) => trailer.type === 'Trailer')
      );
      console.log('✅ Trailer fetched successfully');
    } catch (e) {
      console.log('💀 Failed to fetch movie trailer:', e);
    }

    try {
      const providers = await axios.get(providerUrl);
      setProviders(providers.data.results);
      console.log('✅ Providers fetched successfully');
    } catch (e) {
      console.log('💀 Failed to fetch movie providers:', e);
    }
  }, [params, navigate]);

  useLayoutEffect(() => {
    fetchMovie();
    window.scrollTo(0, 0);
  }, [fetchMovie]);

  useTitle(
    `${movieData.title || movieData.name}${
      params.type === 'movie'
        ? ` (${movieData?.release_date?.slice(0, 4)})`
        : ` (TV Series ${movieData?.first_air_date?.slice(0, 4)})`
    } — The Movie Database (TMDB)`
  );

  const getColors = (color) => {
    setColors(color);
  };

  const handleClose = () => {
    setModalProps((prevState) => ({
      ...prevState,
      open: false,
      handleClose,
    }));
  };

  const openTrailer = () => {
    setModalProps({
      data: trailerData,
      open: true,
      handleClose,
    });
  };

  const bgImage = {
    backgroundImage: `url(${BACKDROP_URL}${movieData.backdrop_path})`,
  };

  const bgBackDrop = {
    backgroundImage: `linear-gradient(to right, ${colors[2]} 150px, ${
      colors[5] + 'd6'
    } 100%)`,
  };

  const date = movieData.release_date || movieData.first_air_date;

  return (
    !loading &&
    movieData && (
      <>
        <section className={styles.viewMore}>
          <div className={styles.header} style={bgImage}>
            <div className={styles.backdrop} style={bgBackDrop}>
              <div
                className={`${styles['single-column']} ${
                  movieData.poster_path ? 'font-white' : 'font-black'
                }`}
              >
                <section className={styles['inner-section']}>
                  <div className={styles['poster-wrapper']}>
                    <div
                      className={styles.poster}
                      style={{
                        borderRadius:
                          providers && (providers.IN || providers.US)
                            ? '0'
                            : '8px',
                        background:
                          providers && (providers.IN || providers.US)
                            ? 'transparent'
                            : '#dbdbdb',
                      }}
                    >
                      <div className={styles.image_content}>
                        <ColorExtractor getColors={getColors}>
                          <img
                            className={`${styles.poster} ${
                              !movieData.poster_path
                                ? styles['fallback-poster']
                                : ''
                            }`}
                            src={`${POSTER_URL}/${movieData.poster_path}`}
                            alt='poster'
                            loading='lazy'
                            onError={(e) => (e.target.src = imageErrorSrc)}
                          />
                        </ColorExtractor>
                      </div>
                    </div>
                    {providers && providers.IN && (
                      <div className={styles.ott_offer}>
                        <div className={styles['text-wrapper']}>
                          <div className={styles.button}>
                            <div className={styles.provider}>
                              <img
                                src={
                                  providers.IN.flatrate
                                    ? `${STREAMING_URL}/${providers.IN.flatrate[0].logo_path}`
                                    : providers.IN.buy
                                    ? `${STREAMING_URL}/${providers.IN.buy[0].logo_path}`
                                    : providers.IN.ads
                                    ? `${STREAMING_URL}/${providers.IN.ads[0].logo_path}`
                                    : `${STREAMING_URL}/${providers.IN.free[0].logo_path}`
                                }
                                width='36'
                                height='36'
                                alt='Now Streaming on Hotstar'
                                loading='lazy'
                              />
                            </div>
                            <div className={styles.text}>
                              <span>
                                <h4>Now Streaming</h4>
                                <h3>
                                  <Link
                                    to='/'
                                    title='Available to Rent or Buy on Apple iTunes'
                                  >
                                    Watch Now
                                  </Link>
                                </h3>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.header_poster_wrapper}>
                    <section className={styles['inner-content']}>
                      <div className={styles.title}>
                        <h2>
                          <span>{movieData.title || movieData.name}</span>
                          <span className={styles.release_date}>
                            {date && ' (' + dateToYear(date) + ')'}
                          </span>
                        </h2>
                        <div className={styles.facts}>
                          <span className={styles.release}>
                            {date && slashDate(date)}{' '}
                            {movieData &&
                              movieData.production_countries[0] &&
                              ' (' +
                                movieData.production_countries[0].iso_3166_1 +
                                ')'}
                          </span>
                          {movieData.genres?.length > 0 && (
                            <>
                              <span className={styles.divider}>•</span>
                              <span className={styles.genres}>
                                {genreNames(movieData.genres)}
                              </span>
                            </>
                          )}
                          {(movieData.runtime ||
                            movieData.episode_run_time[0]) && (
                            <>
                              <span className={styles.divider}>•</span>
                              <span className={styles.runtime}>
                                {convertRuntime(
                                  movieData.runtime ||
                                    movieData.episode_run_time[0]
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ul className={styles.actions}>
                        <li className={`${styles.chart} rating-progress`}>
                          <RatingProgress
                            size={60}
                            isViewMore
                            hover
                            borderThickness={3}
                            fontSize='16px'
                            vote_average={movieData.vote_average}
                            thickness={2.8}
                          />
                          <div className={styles.text}>
                            User
                            <br />
                            Score
                          </div>
                        </li>
                        {trailerData && (
                          <li
                            onClick={() => openTrailer(movieData.id)}
                            className={styles.play_trailer}
                          >
                            <PlayArrowIcon sx={{ mr: '10px' }} /> Play Trailer
                          </li>
                        )}
                      </ul>

                      <div className='header_info'>
                        {movieData.tagline && (
                          <h3 className={styles.tagline} dir='auto'>
                            {movieData.tagline}
                          </h3>
                        )}

                        <h3 dir='auto'>Overview</h3>
                        <div className='overview' dir='auto'>
                          <p>
                            {movieData.overview ||
                              "We don't have an overview translated in English. Help us expand our database by adding one."}
                          </p>
                        </div>

                        <ol className={styles.people}>
                          {movieData.created_by?.map((creator) => (
                            <li key={creator.id}>
                              <p>
                                <span>{creator.name}</span>
                              </p>
                              <p className={styles.character}>Creator</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
        {movieData && <TrailerModal {...modalProps} />}
        <CastContainer type={params.type} id={params.id} {...{ movieData }} />
      </>
    )
  );
};
export default ViewMore;
