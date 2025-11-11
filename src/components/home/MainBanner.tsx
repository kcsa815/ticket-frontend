import styles from './MainBanner.module.css'
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import bannerImg1 from '../../assets/images/banner-1.jpg'
import bannerImg2 from '../../assets/images/banner-2.jpg'
import bannerImg3 from '../../assets/images/banner-3.jpg'
import bannerImg4 from '../../assets/images/banner-4.jpg'

const bannerImages = [
    {id : 1, src:bannerImg1, alt:'배너 1'},
    {id : 2, src:bannerImg2, alt:'배너 2'},
    {id : 3, src:bannerImg3, alt:'배너 3'},
    {id : 4, src:bannerImg4, alt:'배너 4'},
]

function MainBanner(){
    
    const settings = {
        dots : true,
        infinite : true,
        speed : 1000,
        slidesToShow:1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000
    };

    return (
        <div className={styles.bannerContainer}>
            <Slider {...settings}>
                {bannerImages.map((image) => (
                    <div key={image.id} className={styles.slideItem}>
                        <img
                            src={image.src}
                            alt={image.alt}
                            className={styles.bannerImage}
                        />
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default MainBanner;