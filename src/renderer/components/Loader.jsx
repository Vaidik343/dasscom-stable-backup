import React from 'react'
import Lottie from 'lottie-react'
import loader from '../../assets/Loader.json'
// import scanning from '../../assets/Scanning.json'
// import plus_loader from '../../assets/pulse loader.json'

const Loader = () => {

    const styles = {
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
        }
    }
  return (
    <div style={styles.container}>
        <Lottie 
           animationData={loader}
           loop={true}
           style={{width: 150, height: 150}}
        
        />



    </div>
  )
}

export default Loader