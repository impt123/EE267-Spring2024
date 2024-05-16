#include "PoseMath.h"

/**
 * TODO: see header file for documentation
 */
void convertTicksTo2DPositions(uint32_t clockTicks[8], double pos2D[8])
{
  //use variable CLOCKS_PER_SECOND defined in PoseMath.h
  //for number of clock ticks a second
  double deltaTime[8];
  for(int x=0; x<8; x++)
  {
    deltaTime[x] = 1.0 * clockTicks[x] / CLOCKS_PER_SECOND;
  }
  double alphaH;
  double alphaV;
  for(int x=0; x<8; x++)
  {
    if( x % 2 == 0 ){ 
      alphaH = -deltaTime[x] * 60.0 * 360.0 + 90.0; 
      pos2D[x] = tan(2.0 * 3.14159 * alphaH / 360.0);
    } else {
      alphaV = deltaTime[x] * 60.0 * 360.0 - 90.0; 
      pos2D[x] = tan(2.0 * 3.14159 * alphaV / 360.0); 
    }
  }


}

/**
 * TODO: see header file for documentation
 */
void formA(double pos2D[8], double posRef[8], double Aout[8][8]) {
  for(int x=0; x<8; x++)
  {
    if( x % 2 == 0 ){ 
      Aout[x][0] = posRef[x];   Aout[x][1] = posRef[x+1];   Aout[x][2] = 1;                       Aout[x][3] = 0;
      Aout[x][4] = 0;           Aout[x][5] = 0;             Aout[x][6] = -posRef[x] * pos2D[x];   Aout[x][7] = -posRef[x+1] * pos2D[x];
    } else {
      Aout[x][0] = 0;           Aout[x][1] = 0;             Aout[x][2] = 0;                       Aout[x][3] = posRef[x-1];
      Aout[x][4] = posRef[x];   Aout[x][5] = 1;             Aout[x][6] = -posRef[x-1] * pos2D[x]; Aout[x][7] = -posRef[x] * pos2D[x];
    }
  } 

}


/**
 * TODO: see header file for documentation
 */
bool solveForH(double A[8][8], double b[8], double hOut[8]) {
  //use Matrix Math library for matrix operations
  //example:
  //int inv = Matrix.Invert((double*)A, 8);
  //if inverse fails (Invert returns 0), return false
  int inv = Matrix.Invert((double*) A, 8);
  if(inv==0) { 
    return false;
  }
  else{
    Matrix.Multiply((double*) A, (double*) b, 8, 8, 1, (double*) hOut);
    return true;
  }

}


/**
 * TODO: see header file for documentation
 */
void getRtFromH(double h[8], double ROut[3][3], double pos3DOut[3]) {
  double sScale = 2.0 / (sqrt(h[0]*h[0] + h[3]*h[3] + h[6]*h[6]) + sqrt(h[1]*h[1] + h[4]*h[4] + h[7]*h[7]));
  pos3DOut[0] = sScale * h[2]; pos3DOut[1] = sScale * h[5]; pos3DOut[2] = -sScale;
  double r1Len = sqrt(h[0]*h[0] + h[3]*h[3] + h[6]*h[6]);
  ROut[0][0] = h[0] / r1Len; ROut[1][0] = h[3] / r1Len; ROut[2][0] = -h[6] / r1Len;
  double dotR1R2 = ROut[0][0] * h[1] + ROut[1][0] * h[4] - ROut[2][0] * h[7]; 
  double r01, r11, r21;
  r01 = (h[1] - ROut[0][0] * dotR1R2); r11 = (h[4] - ROut[1][0] * dotR1R2); r21 = (-h[7] - ROut[2][0] * dotR1R2);
  double r2Len = sqrt(pow(r01, 2.0) + pow(r11, 2.0) + pow(r21, 2.0));
  ROut[0][1] = r01/r2Len; ROut[1][1] = r11/r2Len; ROut[2][1] = r21/r2Len;
  ROut[0][2] = ROut[1][0] * ROut[2][1] - ROut[2][0] * ROut[1][1];
  ROut[1][2] = ROut[2][0] * ROut[0][1] - ROut[0][0] * ROut[2][1];
  ROut[2][2] = ROut[0][0] * ROut[1][1] - ROut[1][0] * ROut[0][1];



}



/**
 * TODO: see header file for documentation
 */
Quaternion getQuaternionFromRotationMatrix(double R[3][3]) {
  double qW = sqrt(1.0 + pow(R[0][0], 2.0) + pow(R[1][1], 2.0) + pow(R[2][2], 2.0)) / 2.0;
  double qX = (R[2][1] - R[1][2]) / 4.0 / qW;
  double qY = (R[0][2] - R[2][0]) / 4.0 / qW;
  double qZ = (R[1][0] - R[0][1]) / 4.0 / qW;
  return Quaternion(qW, qX, qY, qZ);

}
