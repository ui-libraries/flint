<div class="container">
  <div class="row mb-3">
    <div class="col">
      <h3>Search the Flint Water Crisis Email Archive</h3>
      <form id="email-search-form">
        <table id="searchTable" class="table table-bordered">
          <thead>
            <tr>
              <th>Search For 
                <td colspan="2">
                  <button id="addRow" type="button" class="btn btn-primary">Add Search Field</button>
                </td>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="searchRow">
              <td><input type="text" placeholder="Enter search term..." class="form-control" /></td>
              <td>
                <select class="form-control">
                  <option value="sender/receiver">Sender/Receiver</option>
                  <option value="subject">Subject Line</option>
                  <option value="keyword">Keyword</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="min">Minimum date:</label>
            <input type="text" id="min" name="min" class="form-control" placeholder="2011-01-01">
          </div>
          <div class="col-md-6">
            <label for="max">Maximum date:</label>
            <input type="text" id="max" name="max" class="form-control" placeholder="2020-01-01">
          </div>
        </div>

        <div class="row mb-3">
          <div class="col">
            <button id="searchBtn" type="submit" class="btn btn-success">Search</button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <div class="row mb-3">
    <div class="col">
      <canvas id="emailChart" width="400" height="200"></canvas>
    </div>
  </div>

  <div class="row">
    <div class="col">
      <table id="emailTable" class="display table table-bordered">
        <thead>
          <tr>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Subject Line</th>
            <th>Timestamp</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          <!-- Data will go here -->
        </tbody>
      </table>
    </div>
  </div>
</div>

<div id="search-results" class="posts-text-grid"></div>
<nav id="pagination" class="pagination _center"></nav>
