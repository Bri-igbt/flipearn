import React, {useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";

const ManageListing = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const { userListings } = useSelector(state => state.listing);

    const [loadingListing, setLoadingListing] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        platform: "",
        username: "",
        followers_count: "",
        engagement_rate: "",
        monthly_views: "",
        niche: "",
        price: "",
        description: "",
        verified: false,
        monetized: false,
        country: "",
        age_range: "",
        images: [],
    })

    return (
        <div>ManageListing</div>
    )
}
export default ManageListing
