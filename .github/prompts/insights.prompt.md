Generate a comprehensive Playwright test suite using @playwright/test in java script  


Flow:
1. click on login button to goto login form -> Log in as host (navaneetha.b+1@ngenux.com, 'Ngenux@123')
2. click on " insights" from the sidebar
3. click on create, select option in use case , there are 4 use case options, create each workspace with each use case
4. verify the workspace is created 
5. verify all the elements and flow funtionality



create the manual test cases in csv file format with the following columns:
- Test Case ID
- Test Description
- Expected Result
- Actual Result
- Status (Pass/Fail)

as well as the Playwright test code that automates the manual test cases scenarios:
Test Expectations:
- Automatically cover all relevant positive, negative, and edge test cases
- use Page Object model 
- use ecmascript syntax - import/export
- Write each assertion in a separate `test()` block with meaningful names
- Use only stable selectors like `getByRole` or `getByTestId`
- Focus on functional testing: verify not just visibility, but behavior and outcome of each action
- Organize tests using `test.describe()` for clarity
- Save the test file in the `/tests` directory
