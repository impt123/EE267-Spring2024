#include "OrientationTracker.h"

OrientationTracker::OrientationTracker(double imuFilterAlphaIn,  bool simulateImuIn) :

  imu(),
  gyr{0,0,0},
  acc{0,0,0},
  gyrBias{0,0,0},
  gyrVariance{0,0,0},
  accBias{0,0,0},
  accVariance{0,0,0},
  previousTimeImu(0),
  imuFilterAlpha(imuFilterAlphaIn),
  deltaT(0.0),
  simulateImu(simulateImuIn),
  simulateImuCounter(0),
  flatlandRollGyr(0),
  flatlandRollAcc(0),
  flatlandRollComp(0),
  quaternionGyr{1,0,0,0},
  eulerAcc{0,0,0},
  quaternionComp{1,0,0,0}

  {

}

void OrientationTracker::initImu() {
  imu.init();
}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::measureImuBiasVariance() {

  //check if imu.read() returns true
  //then read imu.gyrX, imu.accX, ...

  //compute bias, variance.
  //update:
  //gyrBias[0], gyrBias[1], gyrBias[2]
  //gyrVariance[0], gyrBias[1], gyrBias[2]
  //accBias[0], accBias[1], accBias[2]
  //accVariance[0], accBias[1], accBias[2]

  const int numSamples = 1000;
  int sampleCount = 0;
  double gyrSum[3] = {0,0,0};
  double accSum[3] = {0,0,0};
  double gyrSqSum[3] = {0,0,0}; // Sum of squares for variance calculation
  double accSqSum[3] = {0,0,0};

  while (sampleCount < numSamples) {
      if (imu.read()) {
          // Read gyroscope and accelerometer data
          double varGyrX = imu.gyrX; //getGyr()[0];
          double varGyrY = imu.gyrY; //getGyr()[1];
          double varGyrZ = imu.gyrZ; //getGyr()[2];
          double varAccX = imu.accX; //getAcc()[0];
          double varAccY = imu.accY; //getAcc()[1];
          double varAccZ = imu.accZ; //getAcc()[2];

          // Accumulate sums and sums of squares
          gyrSum[0] += varGyrX; gyrSum[1] += varGyrY; gyrSum[2] += varGyrZ;
          accSum[0] += varAccX; accSum[1] += varAccY; accSum[2] += varAccZ;

          // gyrSqSum[0] += pow(varGyrX - gyrBias[0], 2); gyrSqSum[1] += pow(varGyrY - gyrBias[1], 2); gyrSqSum[2] += pow(varGyrZ - gyrBias[2], 2);
          // accSqSum[0] += pow(varAccX - accBias[0], 2); accSqSum[1] += pow(varAccY - accBias[1], 2); accSqSum[2] += pow(varAccZ - accBias[2], 2);
          gyrSqSum[0] += pow(varGyrX, 2); gyrSqSum[1] += pow(varGyrY, 2); gyrSqSum[2] += pow(varGyrZ, 2);
          accSqSum[0] += pow(varAccX, 2); accSqSum[1] += pow(varAccY, 2); accSqSum[2] += pow(varAccZ, 2);

          sampleCount++;
      }
  }

  // Calculate bias and variance
  for (int i = 0; i < 3; i++) {
      gyrBias[i] = gyrSum[i] / numSamples;
      accBias[i] = accSum[i] / numSamples;

      gyrVariance[i] = gyrSqSum[i] / numSamples - pow(gyrSum[i] / numSamples, 2);
      accVariance[i] = accSqSum[i] / numSamples - pow(accSum[i] / numSamples, 2);
  }



}

void OrientationTracker::setImuBias(double bias[3]) {

  for (int i = 0; i < 3; i++) {
    gyrBias[i] = bias[i];
  }

}

void OrientationTracker::resetOrientation() {

  flatlandRollGyr = 0;
  flatlandRollAcc = 0;
  flatlandRollComp = 0;
  quaternionGyr = Quaternion();
  eulerAcc[0] = 0;
  eulerAcc[1] = 0;
  eulerAcc[2] = 0;
  quaternionComp = Quaternion();

}

bool OrientationTracker::processImu() {

  if (simulateImu) {

    //get imu values from simulation
    updateImuVariablesFromSimulation();

  } else {

    //get imu values from actual sensor
    if (!updateImuVariables()) {

      //imu data not available
      return false;

    }

  }

  //run orientation tracking algorithms
  updateOrientation();

  return true;

}

void OrientationTracker::updateImuVariablesFromSimulation() {

    deltaT = 0.002;
    //get simulated imu values from external file
    for (int i = 0; i < 3; i++) {
      gyr[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    for (int i = 0; i < 3; i++) {
      acc[i] = imuData[simulateImuCounter + i];
    }
    simulateImuCounter += 3;
    simulateImuCounter = simulateImuCounter % nImuSamples;

    //simulate delay
    delay(1);

}

/**
 * TODO: see documentation in header file
 */
bool OrientationTracker::updateImuVariables() {

  //sample imu values
  if (!imu.read()) {
  // return false if there's no data
    return false;
  }

  //call micros() to get current time in microseconds
  //update:
  //previousTimeImu (in seconds)
  //deltaT (in seconds)

  //read imu.gyrX, imu.accX ...
  //update:
  //gyr[0], ...
  //acc[0], ...

  double currentTime = micros();
  deltaT = currentTime / 1000000.00 - previousTimeImu;
  previousTimeImu = currentTime / 1000000.00;

  // You also need to appropriately modify the update of gyr as instructed in (2.1.3).
  gyr[0] = imu.gyrX - gyrBias[0];
  gyr[1] = imu.gyrY - gyrBias[1];
  gyr[2] = imu.gyrZ - gyrBias[2];

  acc[0] = imu.accX;
  acc[1] = imu.accY;
  acc[2] = imu.accZ;

  return true;

}


/**
 * TODO: see documentation in header file
 */
void OrientationTracker::updateOrientation() {

  //call functions in OrientationMath.cpp.
  //use only class variables as arguments to functions.

  //update:
  flatlandRollGyr = computeFlatlandRollGyr(flatlandRollGyr, gyr, deltaT);
  flatlandRollAcc = computeFlatlandRollAcc(acc);
  flatlandRollComp = computeFlatlandRollComp(flatlandRollComp, gyr, flatlandRollAcc, deltaT, imuFilterAlpha);
  //quaternionGyr
  //eulerAcc
  //quaternionComp




}
