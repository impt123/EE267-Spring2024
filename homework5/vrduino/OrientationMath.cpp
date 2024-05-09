#include "OrientationMath.h"

double sgn(double val) {
    if (val > 0.0) {
        return 1.0; // Return 1.0 if positive
    } else if (val < 0.0) {
        return -1.0; // Return -1.0 if negative
    } else {
        return 0.0; // Return 0.0 if zero
    }
}

/** TODO: see documentation in header file */
double computeAccPitch(double acc[3]) {

  return - atan2( acc[2], sgn(acc[1]) * sqrt(pow(acc[0], 2.0) + pow(acc[1], 2.0))) / 3.14159 * 180.0;

}

/** TODO: see documentation in header file */
double computeAccRoll(double acc[3]) {

  return - atan2( - acc[0], acc[1] ) / 3.14159 * 180.0;

}

/** TODO: see documentation in header file */
double computeFlatlandRollGyr(double flatlandRollGyrPrev, double gyr[3], double deltaT) {

  return flatlandRollGyrPrev + gyr[2] * deltaT; // / 180.00 * 3.14159;

}

/** TODO: see documentation in header file */
double computeFlatlandRollAcc(double acc[3]) {

  return atan2(acc[0], acc[1]) / 3.14159 * 180.00;

}

/** TODO: see documentation in header file */
double computeFlatlandRollComp(double flatlandRollCompPrev, double gyr[3], double flatlandRollAcc, double deltaT, double alpha) {

  return alpha * (flatlandRollCompPrev + gyr[2] * deltaT) + (1 - alpha) * flatlandRollAcc;

}


/** TODO: see documentation in header file */
void updateQuaternionGyr(Quaternion& q, double gyr[3], double deltaT) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  double gyrLen = sqrt(pow(gyr[0],2.0) + pow(gyr[1],2.0) + pow(gyr[2],2.0));
  if (gyrLen>1e-8) {
    Quaternion qDelta = Quaternion().setFromAngleAxis(deltaT * gyrLen, gyr[0]/gyrLen, gyr[1]/gyrLen, gyr[2]/gyrLen);
    qDelta.normalize();
    q = Quaternion().multiply(q, qDelta);
    q.normalize();
  }

}


/** TODO: see documentation in header file */
void updateQuaternionComp(Quaternion& q, double gyr[3], double acc[3], double deltaT, double alpha) {
  // q is the previous quaternion estimate
  // update it to be the new quaternion estimate
  double gyrLen = sqrt(pow(gyr[0],2.0) + pow(gyr[1],2.0) + pow(gyr[2],2.0));
  if (gyrLen>1e-8) {
    Quaternion qDelta = Quaternion().setFromAngleAxis(deltaT * gyrLen, gyr[0]/gyrLen, gyr[1]/gyrLen, gyr[2]/gyrLen);
    Quaternion qCurrent = Quaternion().multiply(q, qDelta);
    Quaternion qaBody = Quaternion(0.0, acc[0], acc[1], acc[2]);
    Quaternion qaWorld = qaBody.rotate(qCurrent);
    qaWorld.normalize();
    double phi = acos(qaWorld.q[2]);
    double nQaQup[3] = { - qaWorld.q[3] , 0.0 , qaWorld.q[1] };
    double nQaQupLen = sqrt(pow(nQaQup[0], 2.0) + pow(nQaQup[1], 2.0) + pow(nQaQup[2], 2.0));
    nQaQup[0] /= nQaQupLen; nQaQup[1] /= nQaQupLen; nQaQup[2] /= nQaQupLen;
    Quaternion qTiltCorr = Quaternion().setFromAngleAxis((1-alpha) * phi / 3.14159 * 180.0, nQaQup[0], nQaQup[1], nQaQup[2]);
    Quaternion qComp = Quaternion().multiply(qTiltCorr, qCurrent);
    Quaternion qUp = qaBody.rotate(qComp);
    qUp.normalize();
    qComp.normalize();
    q = qComp;
  }else{
    q = q;
  }

}
