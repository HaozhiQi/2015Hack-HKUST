from math import sqrt
import numpy as np
import cv2
import matplotlib.pyplot as plt
from subprocess import call
from PIL import Image
from PIL import ImageEnhance


help_message = '''
USAGE: opt_flow.py [<video_source>]

Keys:
 1 - toggle HSV flow visualization
 2 - toggle glitch

'''

def draw_flow(img, flow, step=16):
    h, w = img.shape[:2]
    y, x = np.mgrid[step/2:h:step, step/2:w:step].reshape(2,-1)
    fx, fy = flow[y,x].T
    lines = np.vstack([x, y, x+fx, y+fy]).T.reshape(-1, 2, 2)
    lines = np.int32(lines + 0.5)
    vis = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    cv2.polylines(vis, lines, 0, (0, 255, 0))
    for (x1, y1), (x2, y2) in lines:
        cv2.circle(vis, (x1, y1), 1, (0, 255, 0), -1)
    return vis

def draw_hsv(flow):
    h, w = flow.shape[:2]
    fx, fy = flow[:,:,0], flow[:,:,1]
    ang = np.arctan2(fy, fx) + np.pi
    v = np.sqrt(fx*fx+fy*fy)
    hsv = np.zeros((h, w, 3), np.uint8)
    hsv[...,0] = ang*(180/np.pi/2)
    hsv[...,1] = 255
    hsv[...,2] = np.minimum(v*4, 255)
    bgr = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    return bgr

def detect_edge(filename, t1, t2):
  img = cv2.imread(filename, 0) # read and convert to grayscale
  edges = cv2.Canny(img, t1, t2)

  plt.subplot(121),plt.imshow(img, cmap = 'gray')
  plt.title('Original Image'), plt.xticks([]), plt.yticks([])
  plt.subplot(122),plt.imshow(edges, cmap = 'gray')
  plt.title('Edge Image'), plt.xticks([]), plt.yticks([])

  plt.show()

def show_boundary(img, flow):
    threshold = 2
    h, w = flow.shape[:2]
    for r in xrange(0, h):
        length = [sqrt(x*x + y*y) for (x, y) in flow[r]]
        left = 0
        in_state = False
        right = w-1
        while left < w:
            if length[left] < threshold and not in_state:
                pass
            elif length[left] < threshold and in_state:
                in_state = False
                cv2.circle(img, (left, r), 2, [0, 0, 225])
            elif length[left] >= threshold and in_state:
                pass
            else:
                in_state = True
                cv2.circle(img, (left, r), 2, [225, 0, 0])
            if in_state:
                img[r][left] = [0, 0, 0]
            left += 1

        # while right >= 0 and length[right] <= threshold:
        #     right -= 1
        # if left < right:
        #     cv2.circle(img, (right, r), 1, [225, 0, 0])

# cap = cv2.VideoCapture('train_data/seq4.MOV')
# ret, c0 = cap.read()
# # c0 = cv2.resize(c0 (0,0), fx=0.5, fy=0.5)
# g0 = cv2.cvtColor(c0, cv2.COLOR_BGR2GRAY)
# ret, c1 = cap.read()
# # c1 = cv2.resize(c1 (0,0), fx=0.5, fy=0.5)
# g1 = cv2.cvtColor(c1, cv2.COLOR_BGR2GRAY)

# flow = cv2.calcOpticalFlowFarneback(g0, g1, 0.5, 3, 15, 3, 5, 1.2, 0)
# draw_flow(g0, flow)
# # show_boundary(c0, flow)
# cv2.imshow('c0', g0)

""" 
    sum over the vertor length 
    c0 is has better result
    if r_blocks and c_blocks increases, alpha * mean_sums, alpha should decrese
"""
def crop_0(img, flow, r_blocks = 18, c_blocks = 32):
    h, w = flow.shape[:2]
    r_step = h / r_blocks
    c_step = w / c_blocks
    sums = [[0 for x in range(w/c_step)] for x in range(h/r_step)]
    total_sum = 0
    for rk in xrange(0, h, r_step):
        for ck in xrange(0, w, c_step):
            for r in xrange(0, r_step):
                for c in xrange(0, c_step):
                    sums[rk/r_step][ck/c_step] += sqrt(flow[rk+r][ck+c][0]**2 + flow[rk+r][ck+c][1]**2)
            total_sum += sums[rk/r_step][ck/c_step]
    mean_sums = total_sum / (r_blocks * c_blocks)
    for rk in xrange(0, h, r_step):
        for ck in xrange(0, w, c_step):
            if sums[rk/r_step][ck/c_step] > 0.6 * mean_sums:
                for r in xrange(0, r_step):
                    for c in xrange(0, c_step):
                        img[rk+r][ck+c] = [0, 0, 225]

def crop_1(img, flow, r_blocks = 18, c_blocks = 32):
    h, w = flow.shape[:2]
    r_step = h / r_blocks
    c_step = w / c_blocks
    sums = [[[0, 0] for x in range(w/c_step)] for x in range(h/r_step)]
    total_sum = [0, 0]
    for rk in xrange(0, h, r_step):
        for ck in xrange(0, w, c_step):
            for r in xrange(0, r_step):
                for c in xrange(0, c_step):
                    sums[rk/r_step][ck/c_step][0] += flow[rk+r][ck+c][0]
                    sums[rk/r_step][ck/c_step][1] += flow[rk+r][ck+c][1]
            total_sum[0] += sums[rk/r_step][ck/c_step][0]
            total_sum[1] += sums[rk/r_step][ck/c_step][1]
    mean_sums = [x / (r_blocks * c_blocks) for x in total_sum]
    for rk in xrange(0, h, r_step):
        for ck in xrange(0, w, c_step):
            if abs(sums[rk/r_step][ck/c_step][0]) > 0.4 * abs(mean_sums[0]) \
                and abs(sums[rk/r_step][ck/c_step][1]) > 0.4 * abs(mean_sums[1]):
                for r in xrange(0, r_step):
                    for c in xrange(0, c_step):
                        img[rk+r][ck+c] = [0, 0, 225]

def get_module(vec):
    return sqrt(vec[0]**2 + vec[1]**2)

def paint_block(img, r0, c0, r1, c1, prev = None):
    assert(r0 <= r1 and c0 <= c1)
    for r in xrange(r0, r1):
        for c in xrange(c0, c1):
            if prev is None:
                img[r][c] = [0, 0, 225]
            else:
                img[r][c] = prev[r][c]

def crop_2(curt, prev, flow, alpha = 0.2, r_num_cells = 18, c_num_cells = 32):
    h, w = flow.shape[:2]
    r_step = h / r_num_cells
    c_step = w / c_num_cells
    cell_sums = [[0 for c in range(c_num_cells)] for r in range(r_num_cells)]
    total_sum = 0
    for r in xrange(h):
        for c in xrange(w):
            m = get_module(flow[r][c])
            cell_sums[r/r_step][c/c_step] += m
            total_sum += m
    # print total_sum
    mean_sum = total_sum / (r_num_cells * c_num_cells) * 4
    painted = [[False for ck in xrange(c_num_cells)] for rk in xrange(r_num_cells)]
    for rk in xrange(r_num_cells-1):
        for ck in xrange(c_num_cells-1):
            cell4sum = cell_sums[rk][ck] + cell_sums[rk][ck+1] + cell_sums[rk+1][ck] + cell_sums[rk+1][ck+1]
            if cell4sum > alpha * mean_sum and painted[rk][ck] == False:
                for rkk in xrange(rk, r_num_cells-1, 1):
                    paint_block(curt, rkk*r_step, ck*c_step, (rkk+2)*r_step, (ck+2)*c_step, prev)
                    painted[rkk][ck] = True

def image_enhance(cv_array):
    pil_array = cv2.cvtColor(cv_array, cv2.COLOR_BGR2RGB)
    pil_im = Image.fromarray(pil_array)
    pil_im = ImageEnhance.Brightness(pil_im).enhance(3.5)
    pil_im = ImageEnhance.Contrast(pil_im).enhance(2)
    pil_im = ImageEnhance.Sharpness(pil_im).enhance(0.5)
    enhanced_pil_array = np.array(pil_im)
    return cv2.cvtColor(enhanced_pil_array, cv2.COLOR_RGB2BGR)

def upload_pic(pic_name, url = 'http://ddwrt.jowos.moe:44445/submit.php'):
    call(['curl', '--form', 'fileupload=@%s' % pic_name, url])

if __name__ == '__main__':
    import sys
    print help_message
    try: fn = sys.argv[1]
    except: fn = 0

    cam = cv2.VideoCapture(fn)
    
    ret, curt = cam.read()
    # if not ret:
    #     print "cannot read video"

    curt_gray = cv2.cvtColor(curt, cv2.COLOR_BGR2GRAY)
    h, w = curt.shape[:2]
    prev = [[[255, 255, 255] for c in xrange(w)] for r in xrange(h)]

    fourcc = cv2.cv.CV_FOURCC('m', 'p', '4', 'v')
    out = cv2.VideoWriter('out.mp4', fourcc, 2.0, (w,h))

    # show_hsv = False
    # show_glitch = False
    # cur_glitch = prev.copy()
    ii = 0
    while True:
        ret, next = cam.read()
        if ret == False:
            break
        next_gray = cv2.cvtColor(next, cv2.COLOR_BGR2GRAY)
        flow = cv2.calcOpticalFlowFarneback(curt_gray, next_gray, 0.5, 3, 15, 3, 5, 1.2, 0)

        # cv2.imshow('flow', draw_flow(gray, flow))
        crop_2(curt, prev, flow)
        
        # enhanced_curt = image_enhance(curt)
        print ii
        ii += 1
        cv2.destroyAllWindows()
        cv2.imshow('curt', curt)
        pic_name = 'temp_pic/image_%d.jpg' % ii
        cv2.imwrite(pic_name, curt)
        upload_pic(pic_name)
        out.write(curt)
        # cv2.imshow('curt', enhanced_curt)
        # out.write(enhanced_curt)
        prev = curt
        curt = next
        curt_gray = next_gray
    cam.release()
    out.release()
    cv2.destroyAllWindows()


# resized_image = cv2.resize(image, (1280, 720))
