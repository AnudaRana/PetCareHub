import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const StarRating = ({ rating, onChange, editable = false, showText = true }) => {
    const stars = [];
    
    const handleClick = (val) => {
        if (editable && onChange) {
            onChange(val);
        }
    };

    // Helper to render a star based on value
    const renderStar = (index) => {
        const fullValue = index + 1;
        const halfValue = index + 0.5;
        const quarterValue = index + 0.25;
        const threeQuarterValue = index + 0.75;

        // Display logic
        if (rating >= fullValue) {
            return <StarIcon className="star-ui filled" key={index} onClick={() => handleClick(fullValue)} />;
        } else if (rating >= threeQuarterValue) {
            // We'll use StarHalf for 0.5 and 0.75 for simplicity, 
            // but we can also use custom SVG for 0.25/0.75 if needed.
            // For now let's use the standard MUI half star for anything between 0.25 and 0.75
            return <StarHalfIcon className="star-ui filled" key={index} onClick={() => handleClick(fullValue)} />;
        } else if (rating >= halfValue) {
            return <StarHalfIcon className="star-ui filled" key={index} onClick={() => handleClick(fullValue)} />;
        } else if (rating >= quarterValue) {
            return <StarHalfIcon className="star-ui filled opacity-50" key={index} onClick={() => handleClick(fullValue)} />;
        } else {
            return <StarBorderIcon className="star-ui" key={index} onClick={() => handleClick(fullValue)} />;
        }
    };

    // If editable, we want to allow clicking for 0.25 increments? 
    // Usually, users find it hard to click exact quarters. 
    // Let's implement a simpler selection (half increments) for UX, 
    // unless they specifically want 0.25 increments via a range input.
    
    for (let i = 0; i < 5; i++) {
        stars.push(renderStar(i));
    }

    return (
        <div className={`star-rating-container ${editable ? 'editable' : ''}`}>
            <div className="stars-wrapper">
                {stars}
            </div>
            {showText && <span className="rating-text">{Number(rating).toFixed(1)}/5</span>}
        </div>
    );
};

export default StarRating;
