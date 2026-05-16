			<!-- Brand Logo -->
			<a class="navbar-brand" href="index.php"><img src="img/lays-logo.png" width="32"><?=navbar_brand;?></a>
			<button class="btn btn-link btn-sm order-1 order-lg-0" id="sidebarToggle" href="#"><i class="fas fa-bars"></i></button
            ><!-- Navbar Search-->
            <form class="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">
                <div class="input-group">
                    <!-- <input class="form-control" type="text" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="button"><i class="fas fa-search"></i></button>
                    </div> -->
                </div>
            </form>

            <!-- Navbar-->
            <ul class="navbar-nav ml-auto ml-md-0">

      <!-- Messages Dropdown Menu -->
<?PHP if($_SESSION['username']!=""){?>
      <li class="nav-item dropdown">
        <a class="nav-link" data-toggle="dropdown" href="#">
		<?PHP echo $_SESSION['fullname_th'];?>
          <!-- <i class="far fa-comments"></i> -->

          <span class="badge badge-danger navbar-badge">
          <?PHP 
            if(!empty( $_SESSION['imgMember'] )){
                $imgMember =  $_SESSION['imgMember']  ;
            }else {
                $imgMember = "Performance.png";
            }
            ?>
          <img src="imgMember/<?PHP echo $imgMember ;?>"   height="40px" >
          </span>
        </a>
        <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
          <!-- <a href="#" class="dropdown-item">
            <div class="media">
              <img src="dist/img/user1-128x128.jpg" alt="User Avatar" class="img-size-50 mr-3 img-circle">
              <div class="media-body">
                <h5 class="dropdown-item-title">
                  <?PHP echo $_SESSION['fullname_th'];?>
                  <span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
                </h5>
                <p class="text-sm"><?PHP echo "สถานะ ".$_SESSION['UserST'].' : '.$_SESSION['sysstatus'];?></p>

                <p class="text-sm text-muted"> 
				<?PHP //include('calc_birthday.php'); ?></p>

                <p class="text-sm text-muted"><a href="<?php $PHP_SELF ?>index2.php?module=worktime_manhours" title="ดูข้อมูล"><i class="far fa-clock mr-1"></i> 
				<?PHP include('worktime_count.php'); ?> Hours.</p></a>

              </div>
            </div>
          </a> -->

          <!-- <div class="dropdown-divider"></div> -->
          <a href="#" class="dropdown-item">
            <div class="media">
              <!-- <img src="dist/img/user8-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle mr-3"> -->
              <div class="media-body">
                <h3 class="dropdown-item-title">
                  <?PHP echo $_SESSION['fullname_th'];?>
                  <span class="float-right text-sm text-muted"><i class="fas fa-star"></i></span>
                </h3>
                <p class="text-sm"><?PHP echo "สถานะ ".$_SESSION['UserST'].' : '.$_SESSION['sysstatus'];?></p>
                <!-- <p class="text-sm"><?PHP include('calc_birthday.php'); ?></p> 
                <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> <?PHP include('W_worktime_count.php'); ?> Hours.</p> -->
              </div>
            </div>
          </a>
          <!-- <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item">
            <div class="media">
              <img src="dist/img/user3-128x128.jpg" alt="User Avatar" class="img-size-50 img-circle mr-3">
              <div class="media-body">
                <h3 class="dropdown-item-title">
                  Nora Silvester
                  <span class="float-right text-sm text-warning"><i class="fas fa-star"></i></span>
                </h3>
                <p class="text-sm">The subject goes here</p>
                <p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
              </div>
            </div>
          </a> -->
          <div class="dropdown-divider"></div>

          <a href="<?PHP $PHP_SELF ?>index2.php?module=M_manhour_chart" class="dropdown-item dropdown-footer"><i class="far fa-eye mr-1"></i> View Performance </a>
          <div class="dropdown-divider"></div>
          <a href="<?PHP $PHP_SELF ?>index2.php?module=M_planwork_view" class="dropdown-item dropdown-footer"><i class="far fa-eye mr-1"></i> Plan Work View</a>
          <!-- <div class="dropdown-divider"></div>
          <a href="<?PHP $PHP_SELF ?>index2.php?module=W_planwork_view" class="dropdown-item dropdown-footer"><i class="far fa-eye mr-1"></i> My Plan Work View</a> -->

        </div>
      </li>
<?PHP }?>


                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="userDropdown" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-user fa-fw"></i></a>
                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
					<?PHP if($_SESSION['username']!=""){?>
                        <a class="dropdown-item" href="<?PHP $PHP_SELF ?>index2.php?module=M_personel_form&op=edit&id=<?PHP echo $_SESSION['mem_id'];?>" data-id="<?PHP echo $_SESSION['mem_id']; ?>" data-name="<?PHP echo $_SESSION['mem_id']; ?>"><i class="fa fa-user"></i> Profile</a>
						<a class="dropdown-item" href="<?PHP $PHP_SELF ?>index2.php?module=M_UserLog"><i class="fa fa-book"></i> User Log</a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item" href="<?PHP $PHP_SELF ?>index2.php?module=logout"><i class="fas fa-unlock"></i> Logout</a>
					<?PHP }else{?>
                        <a class="dropdown-item" href="<?PHP $PHP_SELF ?>index2.php?module=login"><i class="fas fa-lock"></i> Login</a>
					<?PHP }?>
                    </div>
                </li>
            </ul>
