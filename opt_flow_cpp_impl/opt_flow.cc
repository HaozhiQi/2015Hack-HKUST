#include <iostream>
#include <opencv2/opencv.hpp>
#include <string>
#include <cmath>
#include <cstdlib>
using namespace std;
using namespace cv;

double get_module(const Vec2f& v)
{
  return sqrt(pow(v[0], 2) + pow(v[1], 2));
}

void paint_block(Mat& curt, const Mat& prev, int r0, int c0, int r1, int c1)
{
  for(int r = r0; r < r1; ++r) {
    for(int c = c0; c < c1; ++c) {
      curt.at<Vec3b>(r,c) = prev.at<Vec3b>(r,c);
    }
  }
}

void crop(Mat& curt, const Mat& prev, const Mat& flow, 
          double alpha = 0.2, int r_num_cells = 18, int c_num_cells = 32)
{
  Size img_size = flow.size();
  int h = img_size.height;
  int w = img_size.width;
  int r_step = h / r_num_cells;
  int c_step = w / c_num_cells;
  Mat cell_sums(r_num_cells, c_num_cells, CV_64F, cvScalar(0.));
  double total_sum = 0;
  for(int r = 0; r < h; ++r) {
    for(int c = 0; c < w; ++c) {
      double m = get_module(flow.at<Vec2f>(r,c));
      cell_sums.at<double>(r/r_step, c/c_step) += m;
      total_sum += m;
    }
  }
  double mean_sum = total_sum / (r_num_cells * c_num_cells) * 4;
  Mat painted(r_num_cells, c_num_cells, CV_8U, cvScalar(0));
  for(int rk = 0; rk < r_num_cells-1; ++rk) {
    for(int ck = 0; ck < c_num_cells-1; ++ck) {
      double cell4sum = cell_sums.at<double>(rk, ck) + cell_sums.at<double>(rk, ck+1) 
                      + cell_sums.at<double>(rk+1, ck) + cell_sums.at<double>(rk+1, ck+1);
      if(cell4sum > alpha * mean_sum && painted.at<unsigned char>(rk,ck) == 0) {
        for(int rkk = rk; rkk < r_num_cells-1; ++rkk) {
          paint_block(curt, prev, rkk*r_step, ck*c_step, (rkk+2)*r_step, (ck+2)*c_step);
          painted.at<unsigned char>(rkk,ck) = 1;
        }
      }
    }
  }
}

/*
void drawOptFlowMap(const Mat& flow, Mat& cflowmap, int step,
                   double scale, const Scalar& color)
{
  for(int y = 0; y < cflowmap.rows; y += step)
    for(int x = 0; x < cflowmap.cols; x += step)
     {
           const Point2f& fxy = flow.at<Point2f>(y, x);
           line(cflowmap, Point(x,y), Point(cvRound(x+fxy.x), cvRound(y+fxy.y)),
                color);
           circle(cflowmap, Point(x,y), 2, color, -1);
     }
}
*/

void upload_pic(const char* filename, int h = 720, int w = 1280, 
                const char* url = "http://ddwrt.jowos.moe:44445/submit.php")
{

  char buffer[100];
  sprintf(buffer, "curl --form \"fileupload=@%s\" %s", filename, url);
  cout << buffer << endl;
  system(buffer);
}

int main(int argc, char** argv)
{
  VideoCapture cap;
  if(argc > 1) {
    cap.open(string(argv[1]));
  } else {
    cap.open(0);
  }

  Mat prev, curt, next;
  cap >> prev;
  cap >> prev;
  cap >> prev;
  cap >> prev;
  cap >> prev;

  cap >> curt;
  Size frame_size = curt.size();
  // Mat prev(frame_size, CV_8UC3);
  // prev = Scalar(255, 255, 255);
  Mat curt_gray, next_gray, flow;
  cvtColor(curt, curt_gray, CV_BGR2GRAY);

  VideoWriter out("out.mp4", CV_FOURCC('m','p','4','v'), 2.0, frame_size);
  VideoWriter origin_out("origin_out.mp4", CV_FOURCC('m','p','4','v'), 2.0, frame_size);

  int i = 0;
  while(true) {
    cap >> next;
    if(!next.data) {
      break;
    }
    origin_out.write(curt);
    cvtColor(next, next_gray, CV_BGR2GRAY);
    calcOpticalFlowFarneback(curt_gray, next_gray, flow, 0.5, 3, 15, 3, 5, 1.2, 0);
    crop(curt, prev, flow);

    ++i;
    cout << i << endl;

    destroyWindow(string("img"));
    imshow(string("img"), curt);
    out.write(curt);

    const char* pic_name = "white_board.png";
    Mat resized_pic;
    resize(curt, resized_pic, Size(1280, 720));   
    imwrite(pic_name, resized_pic);
    upload_pic(pic_name);
  
    prev = curt.clone();
    curt = next.clone();
    curt_gray = next_gray.clone();
  }
  out.release();
  origin_out.release();
  cap.release();
  destroyAllWindows();

  return 0;
}